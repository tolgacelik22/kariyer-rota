import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import { trackEvent } from '@/lib/tracking';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const rawToken = searchParams.get('token');

    if (!rawToken) {
        return NextResponse.redirect(new URL('/?error=missing_token', process.env.NEXT_PUBLIC_BASE_URL));
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const tokenRecord = await prisma.token.findUnique({
            where: { hash: tokenHash },
            include: { user: true }
        });

        if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
            console.warn(`Invalid or expired token attempt: ${rawToken}`);
            return NextResponse.redirect(new URL('/?error=invalid_token', process.env.NEXT_PUBLIC_BASE_URL));
        }

        // Mark token as used
        await prisma.token.update({
            where: { id: tokenRecord.id },
            data: { usedAt: new Date() }
        });

        // Create session JWT
        const sessionToken = jwt.sign(
            { userId: tokenRecord.userId, email: tokenRecord.user.email },
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

        await trackEvent('magic_link_opened', {
            userId: tokenRecord.userId,
            email: tokenRecord.user.email
        });

        return NextResponse.redirect(new URL('/report', process.env.NEXT_PUBLIC_BASE_URL));
    } catch (err) {
        console.error('Token verification failed:', err);
        return NextResponse.redirect(new URL('/?error=system_error', process.env.NEXT_PUBLIC_BASE_URL));
    }
}
