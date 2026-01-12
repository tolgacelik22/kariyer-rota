import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 1. Check if already premium in User table
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (user.isPremium) {
            return NextResponse.json({ isPremium: true });
        }

        // 2. Check if there is a paid ShopierOrder for this email that hasn't been linked yet
        const pendingPaidOrder = await prisma.shopierOrder.findFirst({
            where: {
                email: user.email,
                // In this system, existence in ShopierOrder usually means paid via OSB
            },
            orderBy: { createdAt: 'desc' }
        });

        if (pendingPaidOrder) {
            // Logic found a matching paid order! Unlock premium.
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isPremium: true,
                    premiumActivatedAt: new Date(),
                }
            });

            await prisma.shopierOrder.update({
                where: { id: pendingPaidOrder.id },
                data: { userId }
            });

            await trackEvent('premium_unlocked', {
                email: user.email,
                userId,
                properties: { orderId: pendingPaidOrder.orderId, source: 'verify_fallback' }
            });

            return NextResponse.json({ isPremium: true });
        }

        return NextResponse.json({ isPremium: false });
    } catch (err) {
        console.error('Verify endpoint error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { orderid } = await request.json();

        if (!orderid) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const shopierOrderId = String(orderid);

        // 1. Check if order exists in DB (populated by OSB)
        const order = await prisma.shopierOrder.findUnique({
            where: { orderId: shopierOrderId },
            include: { user: true }
        });

        if (order) {
            // If order exists, it means payment was successful (OSB fired)
            // Ensure user is premium
            if (order.user && !order.user.isPremium) {
                await prisma.user.update({
                    where: { id: order.user.id },
                    data: {
                        isPremium: true,
                        premiumActivatedAt: new Date(),
                    }
                });
            }
            return NextResponse.json({ success: true, isPremium: true });
        }

        // 2. If not found, it means OSB might be delayed.
        return NextResponse.json({
            success: false,
            error: 'Siparişiniz henüz işleniyor olabilir. Lütfen 30 saniye sonra tekrar deneyin.'
        }, { status: 404 });

    } catch (err) {
        console.error('Verify POST error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
