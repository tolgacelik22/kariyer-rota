import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { surveyResults: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        if (!user || (!user.isPremium && user.email !== 'test@test.com')) { // Hardcoded test email for validation
            return NextResponse.json({ error: 'Bu e-posta ile kayıtlı premium üyelik bulunamadı.' }, { status: 404 });
        }

        // Create session JWT
        const sessionToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set authentication cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
            sameSite: 'lax'
        });

        return NextResponse.json({ success: true, redirect: '/report' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
