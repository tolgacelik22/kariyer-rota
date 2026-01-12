import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const rid = searchParams.get('rid');
    const email = searchParams.get('email'); // Optional email from UI

    if (!rid) {
        return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    // 1. If we have email and rid, create a pending purchase for fallback mapping
    if (email && rid) {
        try {
            await prisma.pendingPurchase.create({
                data: {
                    email: email.toLowerCase().trim(),
                    reportId: rid,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
                }
            });
        } catch (e) {
            console.error('Pending purchase creation failed:', e);
        }
    }

    // 2. Redirect to Shopier. 
    // We append the reportId to the Shopier URL if possible, or carry it via "note" 
    // Actually, we use the environment variable for the base URL.
    let targetUrl = process.env.SHOPIER_PREMIUM_URL;

    // In some cases we might want to append parameters if Shopier's product page allows it
    // But most often we rely on the user adding their email during checkout.

    if (targetUrl) {
        return NextResponse.redirect(targetUrl);
    }

    return NextResponse.json({ error: 'Shopier URL not configured' }, { status: 500 });
}
