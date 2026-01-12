import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { trackEvent } from '@/lib/tracking';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const res = formData.get('res');
        const hash = formData.get('hash');

        if (!res || !hash) {
            return new Response('Missing res or hash', { status: 400 });
        }

        const SHOPIER_OSB_USER = process.env.SHOPIER_OSB_USER;
        const SHOPIER_OSB_PASS = process.env.SHOPIER_OSB_PASS;

        if (!SHOPIER_OSB_USER || !SHOPIER_OSB_PASS) {
            return new Response('Configuration error', { status: 500 });
        }

        const expectedHash = crypto
            .createHmac('sha256', SHOPIER_OSB_PASS)
            .update(res + SHOPIER_OSB_USER)
            .digest('hex');

        if (expectedHash !== hash) {
            return new Response('Unauthorized', { status: 401 });
        }

        let payload;
        try {
            payload = JSON.parse(Buffer.from(res, 'base64').toString('utf-8'));
        } catch (e) {
            return new Response('Invalid payload', { status: 400 });
        }

        const { email, orderid, price, currency, productid, istest, customernote } = payload;
        const shopierOrderId = String(orderid);
        const targetEmail = (email || '').toLowerCase().trim();
        const isTestOrder = String(istest) === '1';

        // 1. Idempotency Check
        const existingOrder = await prisma.shopierOrder.findUnique({
            where: { orderId: shopierOrderId },
        });

        if (existingOrder) {
            return new Response('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }

        // 2. Store Order
        const shopierOrder = await prisma.shopierOrder.create({
            data: {
                orderId: shopierOrderId,
                email: targetEmail,
                amount: parseFloat(price) || 0,
                currency: currency || 'TRY',
                productId: String(productid || ''),
                isTest: isTestOrder,
                rawJson: payload,
            }
        });

        // 3. Extract Report ID from customernote if present (Format: "rid:REPORT_ID")
        let reportId = null;
        if (customernote && customernote.includes('rid:')) {
            const match = customernote.match(/rid:([a-zA-Z0-9_\-]+)/);
            if (match) reportId = match[1];
        }

        // 4. Fallback: Check PendingPurchase if no rid in note
        if (!reportId && targetEmail) {
            const pending = await prisma.pendingPurchase.findFirst({
                where: {
                    email: targetEmail,
                    createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 mins
                },
                orderBy: { createdAt: 'desc' }
            });
            if (pending) reportId = pending.reportId;
        }

        // 5. Create Entitlement and Unlock User
        if (targetEmail) {
            const user = await prisma.user.upsert({
                where: { email: targetEmail },
                update: { isPremium: true, premiumActivatedAt: new Date() },
                create: { email: targetEmail, isPremium: true, premiumActivatedAt: new Date() }
            });

            await prisma.shopierOrder.update({
                where: { id: shopierOrder.id },
                data: { userId: user.id }
            });

            if (reportId) {
                await prisma.premiumEntitlement.upsert({
                    where: { email_reportId: { email: targetEmail, reportId } },
                    update: { orderId: shopierOrderId },
                    create: { email: targetEmail, reportId, orderId: shopierOrderId }
                });
            }

            await trackEvent('premium_purchase_success', {
                email: targetEmail,
                userId: user.id,
                properties: { orderId: shopierOrderId, reportId }
            });
        }

        return new Response('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    } catch (err) {
        console.error('Shopier OSB Error:', err);
        return new Response('Error', { status: 500 });
    }
}
