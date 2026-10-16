import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/api';

export async function GET(request, { params }) {
    const { user, error } = await requireUser();
    if (error) return error;
    const { id } = await params;
    const report = await prisma.report.findFirst({ where: { id, userId: user.id } });
    if (!report) return NextResponse.json({ error: 'Rapor bulunamadı.' }, { status: 404 });
    return NextResponse.json({ report });
}

export async function DELETE(request, { params }) {
    const { user, error } = await requireUser();
    if (error) return error;
    const { id } = await params;
    const { count } = await prisma.report.deleteMany({ where: { id, userId: user.id } });
    if (!count) return NextResponse.json({ error: 'Rapor bulunamadı.' }, { status: 404 });
    return NextResponse.json({ success: true });
}
