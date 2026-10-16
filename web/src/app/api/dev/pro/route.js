import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser, userView } from '@/lib/api';
import { extendPro } from '@/lib/plans';

// Demo only (DEMO_MODE=1): lets the app's paywall "purchase" without a store. 404 everywhere else.
export async function POST(request) {
    if (process.env.DEMO_MODE !== '1') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { user, error } = await requireUser();
    if (error) return error;
    const { plan = 'monthly', cancel } = await request.json().catch(() => ({}));
    const updated = cancel
        ? await prisma.user.update({ where: { id: user.id }, data: { proUntil: null, proPlan: null } })
        : await prisma.$transaction((tx) => extendPro(tx, user.id, plan === 'yearly' ? 'yearly' : 'monthly'));
    return NextResponse.json(userView(updated));
}
