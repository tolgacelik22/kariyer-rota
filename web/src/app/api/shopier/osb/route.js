import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { trackEvent } from '@/lib/tracking';

export async function POST(request) {
    try {
        // 1. Get raw body to parse res and hash
        // Shopier sends data as application/x-www-form-urlencoded
        const formData = await request.formData();
        const res = formData.get('res');
        const hash = formData.get('hash');

        if (!res || !hash) {
            return new Response('Missing res or hash', { status: 400 });
        }

        // 2. Validate Hash
        // expectedHash = HMAC_SHA256( res + SHOPIER_OSB_USER, SHOPIER_OSB_PASS )
        const SHOPIER_OSB_USER = process.env.SHOPIER_OSB_USER;
        const SHOPIER_OSB_PASS = process.env.SHOPIER_OSB_PASS;

        if (!SHOPIER_OSB_USER || !SHOPIER_OSB_PASS) {
            console.error('SHOPIER_OSB_USER or PASS not set in env');
            return new Response('Configuration error', { status: 500 });
        }

        const dataToHash = res + SHOPIER_OSB_USER;
        const expectedHash = crypto
            .createHmac('sha256', SHOPIER_OSB_PASS)
            .update(dataToHash)
            .digest('hex');

        if (expectedHash !== hash) {
            console.warn('Shopier OSB Hash Mismatch detected');
            await trackEvent('shopier_hash_mismatch');
            return new Response('Unauthorized', { status: 401 });
        }

        // 3. Decode and Parse Payload
        let payload;
        try {
            const decodedRes = Buffer.from(res, 'base64').toString('utf-8');
            payload = JSON.parse(decodedRes);
        } catch (e) {
            return new Response('Invalid payload encoding', { status: 400 });
        }

        const {
            email,
            orderid,
            currency,
            price,
            productid,
            productlist,
            istest
        } = payload;

        const shopierOrderId = String(orderid);
        const targetEmail = (email || '').toLowerCase().trim();
        const isTestOrder = String(istest) === '1';

        console.log(`Processing Shopier OSB: OrderID=${shopierOrderId}, Email=${targetEmail}, isTest=${isTestOrder}`);

        // 4. Idempotency Check
        const existingOrder = await prisma.shopierOrder.findUnique({
            where: { orderId: shopierOrderId },
        });

        if (existingOrder) {
            return new Response('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }

        // 5. Store Order
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

        // 6. Premium Unlock Logic
        if (!isTestOrder && targetEmail) {
            const PREMIUM_PRODUCT_IDS = (process.env.SHOPIER_PREMIUM_PRODUCT_IDS || '').split(',');

            // Check if productid matches OR if it's in the productlist
            const isPremiumProduct = PREMIUM_PRODUCT_IDS.includes(String(productid)) ||
                PREMIUM_PRODUCT_IDS.some(id => String(productlist).includes(id));

            if (isPremiumProduct) {
                // Upsert user to ensure they exist (fallback if they paid without survey)
                const user = await prisma.user.upsert({
                    where: { email: targetEmail },
                    update: {
                        isPremium: true,
                        premiumActivatedAt: new Date(),
                    },
                    create: {
                        email: targetEmail,
                        isPremium: true,
                        premiumActivatedAt: new Date(),
                    }
                });

                // Link order to user
                await prisma.shopierOrder.update({
                    where: { id: shopierOrder.id },
                    data: { userId: user.id }
                });

                await trackEvent('premium_unlocked', {
                    email: targetEmail,
                    userId: user.id,
                    properties: { orderId: shopierOrderId, source: 'shopier_osb' }
                });
            }
        }

        // 7. Success Response (Exactly "success" as plain text)
        return new Response('success', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });

    } catch (err) {
        console.error('Shopier OSB Unexpected Error:', err);
        return new Response('Error', { status: 500 });
    }
}
