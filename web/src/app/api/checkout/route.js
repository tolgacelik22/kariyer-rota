import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/api';
import { checkoutUrl, pricesFor } from '@/lib/plans';
import { trackEvent } from '@/lib/tracking';

// Records purchase intent (per price variant) and returns the Shopier link.
// If no link is configured for the plan, the click is still counted: a fake-door price test.
export async function POST(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const { plan } = await request.json();
    if (!['monthly', 'yearly'].includes(plan)) {
        return NextResponse.json({ error: 'Geçersiz plan.' }, { status: 400 });
    }
    const prices = pricesFor(user.priceVariant);
    const url = checkoutUrl(plan, prices.variant);

    await prisma.pendingPurchase.create({
        data: { email: user.email, reportId: `pro:${plan}`, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await trackEvent('checkout_clicked', {
        userId: user.id,
        email: user.email,
        properties: { plan, variant: prices.variant, price: prices[plan], hasLink: !!url },
    });

    return NextResponse.json({ url, email: user.email });
}
