import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';
import { AUTH_COOKIE, signSession, sessionCookieOptions } from '@/lib/auth';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const rawToken = searchParams.get('token');
    const nextParam = searchParams.get('next') || '/app';
    const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/app';
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    if (!rawToken) {
        return NextResponse.redirect(new URL('/giris?error=missing_token', base));
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const tokenRecord = await prisma.token.findUnique({
            where: { hash: tokenHash },
            include: { user: true },
        });

        if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
            return NextResponse.redirect(new URL('/giris?error=invalid_token', base));
        }

        await prisma.token.update({ where: { id: tokenRecord.id }, data: { usedAt: new Date() } });

        const response = NextResponse.redirect(new URL(next, base));
        response.cookies.set(AUTH_COOKIE, signSession(tokenRecord.user), sessionCookieOptions);

        await trackEvent('magic_link_opened', { userId: tokenRecord.userId, email: tokenRecord.user.email });
        return response;
    } catch (err) {
        console.error('Token verification failed:', err);
        return NextResponse.redirect(new URL('/giris?error=system_error', base));
    }
}
