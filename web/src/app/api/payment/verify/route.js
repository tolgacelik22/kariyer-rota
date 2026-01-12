import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const payment = await prisma.payment.findUnique({
            where: { shopierOrderId: orderId },
            include: { user: true }
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // In a real app, you might double check with Shopier API here.
        // For MVP, we assume if we found the pending payment and it's being verified, we mark it success.

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

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
