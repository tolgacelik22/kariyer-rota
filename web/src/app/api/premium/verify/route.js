import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { email, reportId } = await request.json();

        if (!email || !reportId) {
            return NextResponse.json({ error: 'Email and Report ID required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if an entitlement already exists for this specific report
        let entitlement = await prisma.premiumEntitlement.findUnique({
            where: {
                email_reportId: {
                    email: normalizedEmail,
                    reportId: reportId
                }
            }
        });

        // 2. Fallback: Check if there's a recent paid order for this email 
        // that hasn't been linked to any report yet (or just general paid order)
        if (!entitlement) {
            const purchase = await prisma.shopierOrder.findFirst({
                where: { email: normalizedEmail },
                orderBy: { createdAt: 'desc' }
            });

            if (purchase) {
                // Check if this purchase was intended for this report via PendingPurchase fallback
                const pending = await prisma.pendingPurchase.findFirst({
                    where: {
                        email: normalizedEmail,
                        reportId: reportId,
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (pending || purchase) {
                    // Link it now
                    entitlement = await prisma.premiumEntitlement.upsert({
                        where: {
                            email_reportId: { email: normalizedEmail, reportId }
                        },
                        update: {},
                        create: {
                            email: normalizedEmail,
                            reportId: reportId,
                            orderId: purchase.orderId
                        }
                    });
                }
            }
        }

        if (entitlement) {
            // 3. Mark user as premium globally for convenience (optional, but requested)
            const user = await prisma.user.upsert({
                where: { email: normalizedEmail },
                update: { isPremium: true },
                create: { email: normalizedEmail, isPremium: true }
            });

            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

            const response = NextResponse.json({
                ok: true,
                isPremium: true,
                reportId: reportId,
                email: user.email
            });

            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });

            return response;
        }

        return NextResponse.json({
            ok: false,
            reason: 'not_found',
            error: 'Bu rapor için geçerli bir satın alma kaydı bulunamadı.'
        });
    } catch (err) {
        console.error('Premium Verify Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
