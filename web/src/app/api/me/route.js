import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser, userView } from '@/lib/api';
import { AUTH_COOKIE } from '@/lib/auth';
import { trackEvent } from '@/lib/tracking';

export async function GET() {
    const { user, error } = await requireUser();
    if (error) return error;
    return NextResponse.json(userView(user));
}

export async function PATCH(request) {
    const { user, error } = await requireUser();
    if (error) return error;
    const body = await request.json();
    const data = {};
    if (typeof body.name === 'string') data.name = body.name.trim().slice(0, 80) || null;
    if (typeof body.jobTitle === 'string') data.jobTitle = body.jobTitle.trim().slice(0, 120) || null;
    if (typeof body.reminderOptIn === 'boolean') data.reminderOptIn = body.reminderOptIn;
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json(userView(updated));
}

// KVKK: delete the account and everything the user wrote. Payment records are kept
// (legal accounting obligation) but unlinked from the user.
export async function DELETE() {
    const { user, error } = await requireUser();
    if (error) return error;
    await prisma.$transaction([
        prisma.weeklyEntry.deleteMany({ where: { userId: user.id } }),
        prisma.report.deleteMany({ where: { userId: user.id } }),
        prisma.token.deleteMany({ where: { userId: user.id } }),
        prisma.event.updateMany({ where: { userId: user.id }, data: { userId: null, email: null } }),
        prisma.event.updateMany({ where: { email: user.email }, data: { email: null } }),
        prisma.surveyResult.updateMany({ where: { userId: user.id }, data: { userId: null } }),
        prisma.shopierOrder.updateMany({ where: { userId: user.id }, data: { userId: null } }),
        prisma.consent.updateMany({ where: { userId: user.id }, data: { userId: null } }),
        prisma.user.delete({ where: { id: user.id } }),
    ]);
    await trackEvent('account_deleted');
    const response = NextResponse.json({ success: true });
    response.cookies.delete(AUTH_COOKIE);
    return response;
}
