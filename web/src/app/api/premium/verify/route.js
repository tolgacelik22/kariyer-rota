import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if ANY successful purchase exists for this email
        // In our current OSB setup, records are created ONLY on success/test
        const purchase = await prisma.shopierOrder.findFirst({
            where: { email: normalizedEmail },
            orderBy: { createdAt: 'desc' }
        });

        if (purchase) {
            // 2. Unlock premium for the user
            const user = await prisma.user.upsert({
                where: { email: normalizedEmail },
                update: {
                    isPremium: true,
                    premiumActivatedAt: new Date()
                },
                create: {
                    email: normalizedEmail,
                    isPremium: true,
                    premiumActivatedAt: new Date()
                }
            });

            // 3. Create a JWT for the session
            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

            const response = NextResponse.json({
                ok: true,
                isPremium: true,
                email: user.email
            });

            // Set secure cookie
            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            return response;
        }

        return NextResponse.json({ ok: false, reason: 'not_found' });
    } catch (err) {
        console.error('Premium Verify Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
