import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extendPro } from '@/lib/plans';
import { trackEvent } from '@/lib/tracking';

// Manual Pro unlock (support): POST { email, plan } with header x-admin-token.
export async function POST(request) {
    if (!process.env.ADMIN_TOKEN || request.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { email, plan = 'monthly' } = await request.json();
    const target = String(email || '').toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: target } });
    if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    const updated = await prisma.$transaction((tx) => extendPro(tx, user.id, plan === 'yearly' ? 'yearly' : 'monthly'));
    await trackEvent('pro_granted_manually', { userId: user.id, properties: { plan } });
    return NextResponse.json({ email: updated.email, proUntil: updated.proUntil, proPlan: updated.proPlan });
}
