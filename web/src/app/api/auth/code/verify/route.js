import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { trackEvent } from '@/lib/tracking';
import { signSession } from '@/lib/auth';
import { userView } from '@/lib/api';
import { codeMatches } from '@/lib/loginCode';

const MAX_ATTEMPTS = 5;

// Mobile login step 2: exchange email + code for a 30-day Bearer token.
export async function POST(request) {
    const { email, code } = await request.json();
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const cleanCode = String(code || '').replace(/\D/g, '');
    const invalid = NextResponse.json({ error: 'Kod hatalı ya da süresi dolmuş.' }, { status: 400 });
    if (cleanCode.length !== 6) return invalid;

    const token = await prisma.token.findFirst({
        where: { type: 'login_code', usedAt: null, expiresAt: { gt: new Date() }, user: { email: normalizedEmail } },
        orderBy: { createdAt: 'desc' },
        include: { user: true },
    });
    if (!token || token.attempts >= MAX_ATTEMPTS) return invalid;

    if (!codeMatches(token.hash, normalizedEmail, cleanCode)) {
        await prisma.token.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } });
        return invalid;
    }

    await prisma.token.update({ where: { id: token.id }, data: { usedAt: new Date() } });
    await trackEvent('app_login', { userId: token.userId, email: normalizedEmail });
    return NextResponse.json({ token: signSession(token.user), user: userView(token.user) });
}
