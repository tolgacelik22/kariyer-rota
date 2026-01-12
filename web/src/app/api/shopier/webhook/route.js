import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const body = Object.fromEntries(formData.entries());

        // Shopier Webhook Verification Logic
        const {
            platform_order_id,
            status,
            installment,
            payment_id,
            random_nr,
            signature
        } = body;

        // Verify HMAC Signature (Required for production)
        // const data = random_nr + platform_order_id + total_amount + currency;
        // const expectedSignature = crypto.createHmac('sha256', process.env.SHOPIER_API_SECRET).update(data).digest('base64');
        // if (signature !== expectedSignature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

        if (status === 'success') {
            const payment = await prisma.payment.findUnique({
                where: { shopierOrderId: platform_order_id },
            });

            if (payment && payment.status !== 'completed') {
                await prisma.$transaction([
                    prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: 'completed' }
                    }),
                    prisma.user.update({
                        where: { id: payment.userId },
                        data: { isPremium: true }
                    })
                ]);
            }
        }

        return new Response('OK', { status: 200 });
    } catch (err) {
        console.error('Webhook processing failed:', err);
        return new Response('Error', { status: 500 });
    }
}
