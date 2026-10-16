import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/api';
import { isPro } from '@/lib/plans';
import { buildReport, templateReport, REPORT_TYPES } from '@/lib/ai';
import { weekStartOf, addWeeks } from '@/lib/week';
import { trackEvent } from '@/lib/tracking';

const DAILY_REPORT_LIMIT = 10;

export async function GET() {
    const { user, error } = await requireUser();
    if (error) return error;
    const reports = await prisma.report.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, periodStart: true, periodEnd: true, source: true, entryCount: true, createdAt: true },
    });
    return NextResponse.json({ types: REPORT_TYPES, reports });
}

export async function POST(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const { type } = await request.json();
    const def = REPORT_TYPES[type];
    if (!def) return NextResponse.json({ error: 'Geçersiz rapor türü.' }, { status: 400 });

    const pro = isPro(user);
    if (def.pro && !pro) {
        await trackEvent('paywall_hit', { userId: user.id, properties: { type } });
        return NextResponse.json({ error: `${def.label} Pro planına dahildir.`, paywall: true }, { status: 402 });
    }

    const today = await prisma.report.count({
        where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    if (today >= DAILY_REPORT_LIMIT) {
        return NextResponse.json({ error: 'Günlük rapor sınırına ulaştın. Yarın tekrar dene.' }, { status: 429 });
    }

    const periodEnd = addWeeks(weekStartOf(), 1);
    const periodStart = addWeeks(periodEnd, -def.weeks);
    const entries = await prisma.weeklyEntry.findMany({
        where: { userId: user.id, weekStart: { gte: periodStart, lt: periodEnd } },
        orderBy: { weekStart: 'asc' },
    });
    if (!entries.length) {
        return NextResponse.json({ error: 'Bu dönem için hiç haftalık kayıt yok. Önce bir kayıt ekle.' }, { status: 400 });
    }

    // Free plan gets the basic (non-AI) summary only.
    const { content, source } = pro ? await buildReport(type, user, entries) : { content: templateReport(type, entries), source: 'template' };

    const report = await prisma.report.create({
        data: { userId: user.id, type, periodStart, periodEnd, content, source, entryCount: entries.length },
    });
    await trackEvent('report_generated', { userId: user.id, properties: { type, source, entryCount: entries.length } });
    return NextResponse.json({ report });
}
