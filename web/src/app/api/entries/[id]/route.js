import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/api';

export async function DELETE(request, { params }) {
    const { user, error } = await requireUser();
    if (error) return error;
    const { id } = await params;
    const { count } = await prisma.weeklyEntry.deleteMany({ where: { id, userId: user.id } });
    if (!count) return NextResponse.json({ error: 'Kayıt bulunamadı.' }, { status: 404 });
    return NextResponse.json({ success: true });
}
