import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';

// RevenueCat → server: in-app subscription state (App Store / Google Play).
// The app calls Purchases.logIn(user.id), so app_user_id is our User.id.
// Configure the webhook in RevenueCat with header "Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>".
const GRANTING = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE', 'TEMPORARY_ENTITLEMENT_GRANT'];

export async function POST(request) {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event } = await request.json();
    if (!event) return NextResponse.json({ ok: true });

    const ids = [event.app_user_id, event.original_app_user_id, ...(event.aliases || [])].filter(Boolean);
    const user = await prisma.user.findFirst({ where: { id: { in: ids } } });
    if (!user) {
        console.warn('RevenueCat webhook: unknown user', event.app_user_id);
        return NextResponse.json({ ok: true });
    }

    const plan = /year|annual/i.test(event.product_id || '') ? 'yearly' : 'monthly';
    if (GRANTING.includes(event.type) && event.expiration_at_ms) {
        await prisma.user.update({ where: { id: user.id }, data: { proUntil: new Date(event.expiration_at_ms), proPlan: plan } });
    } else if (event.type === 'EXPIRATION') {
        await prisma.user.update({ where: { id: user.id }, data: { proUntil: new Date(event.expiration_at_ms || Date.now()) } });
    }
    // CANCELLATION / BILLING_ISSUE keep access until expiration; they are only recorded.

    await trackEvent(`iap_${String(event.type).toLowerCase()}`, {
        userId: user.id,
        properties: { plan, productId: event.product_id, store: event.store, price: event.price_in_purchased_currency, currency: event.currency, variant: 'store' },
    });
    if (event.type === 'INITIAL_PURCHASE') {
        await trackEvent('pro_purchase_success', { userId: user.id, properties: { plan, source: 'iap', store: event.store, variant: user.priceVariant } });
    }
    return NextResponse.json({ ok: true });
}
