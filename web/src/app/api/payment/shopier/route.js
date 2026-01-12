import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // In a real implementation, you would generate a Shopier form here.
    // For the MVP, we will redirect to a mock payment success page 
    // with a fake order_id to demonstrate the flow.

    // Real Shopier logic would involve:
    // 1. Preparing parameters (reseller_api_key, amount, product_name, etc.)
    // 2. Generating a HMAC signature
    // 3. Creating a POST form that autosubmits to Shopier

    // MOCK: Generate a pending payment record
    const shopierOrderId = 'MOCK_' + Math.random().toString(36).substr(2, 9);

    await prisma.payment.create({
        data: {
            userId,
            shopierOrderId,
            amount: 499.00,
            status: 'pending'
        }
    });

    // Mock redirect to payment success (simulating user finishing payment)
    return NextResponse.redirect(new URL(`/report?check=true`, request.url));
}
