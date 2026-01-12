import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If we have a direct Shopier URL defined, use it. 
    // This solves the issue of client-side environment variables being empty.
    if (process.env.SHOPIER_PREMIUM_URL) {
        return NextResponse.redirect(process.env.SHOPIER_PREMIUM_URL);
    }

    // Fallback for development/mocking
    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const shopierOrderId = 'MOCK_' + Math.random().toString(36).substr(2, 9);

    // Check if table exists (Prisma might fail if schema not updated)
    try {
        await prisma.shopierOrder.create({
            data: {
                userId,
                orderId: shopierOrderId,
                amount: 299.00,
                status: 'pending',
                email: 'mock@example.com'
            }
        });
    } catch (e) {
        console.error('Mock order creation failed:', e);
    }

    return NextResponse.redirect(new URL(`/report?check=true`, process.env.NEXT_PUBLIC_BASE_URL || request.url));
}
