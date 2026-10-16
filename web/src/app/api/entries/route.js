import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/api';
import { isPro, FREE_HISTORY_WEEKS, OFFER_AFTER_WEEKS } from '@/lib/plans';
import { weekStartOf, addWeeks, currentStreak } from '@/lib/week';
import { weeklySummary } from '@/lib/ai';
import { trackEvent } from '@/lib/tracking';

const BACKFILL_WEEKS = { free: 1, pro: 8 };

function clean(s, max = 4000) {
    return typeof s === 'string' ? s.trim().slice(0, max) || null : null;
}

function cleanList(list, max) {
    if (!Array.isArray(list)) return [];
    return [...new Set(list.map((s) => String(s).trim()).filter(Boolean))].slice(0, max);
}

export async function GET() {
    const { user, error } = await requireUser();
    if (error) return error;

    const pro = isPro(user);
    const entries = await prisma.weeklyEntry.findMany({
        where: { userId: user.id },
        orderBy: { weekStart: 'desc' },
    });
    const thisWeek = weekStartOf();
    const historyFrom = addWeeks(thisWeek, -(FREE_HISTORY_WEEKS - 1));

    return NextResponse.json({
        currentWeek: thisWeek,
        backfillWeeks: pro ? BACKFILL_WEEKS.pro : BACKFILL_WEEKS.free,
        historyLimitWeeks: pro ? null : FREE_HISTORY_WEEKS,
        stats: {
            total: entries.length,
            streak: currentStreak(entries.map((e) => e.weekStart)),
            loggedThisWeek: entries.some((e) => new Date(e.weekStart).getTime() === thisWeek.getTime()),
            showOffer: !pro && entries.length >= OFFER_AFTER_WEEKS,
        },
        entries: entries.map((e) =>
            pro || new Date(e.weekStart) >= historyFrom
                ? { ...e, locked: false }
                : { id: e.id, weekStart: e.weekStart, locked: true },
        ),
    });
}

export async function PUT(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await request.json();
    const pro = isPro(user);
    const thisWeek = weekStartOf();
    const weekStart = body.weekStart ? weekStartOf(new Date(body.weekStart)) : thisWeek;
    const earliest = addWeeks(thisWeek, -(pro ? BACKFILL_WEEKS.pro : BACKFILL_WEEKS.free));
    if (weekStart > thisWeek || weekStart < earliest) {
        return NextResponse.json(
            { error: pro ? 'En fazla 8 hafta geriye kayıt eklenebilir.' : 'Ücretsiz planda yalnızca bu hafta ve geçen hafta için kayıt eklenebilir.' },
            { status: 400 },
        );
    }

    const wins = clean(body.wins);
    if (!wins) return NextResponse.json({ error: 'Bu hafta yaptıklarını yazmalısın.' }, { status: 400 });

    const data = {
        wins,
        impact: clean(body.impact),
        challenges: clean(body.challenges),
        learnings: clean(body.learnings),
        nextWeek: clean(body.nextWeek),
        tags: cleanList(body.tags, 10),
        links: cleanList(body.links, 10).filter((l) => /^https?:\/\//.test(l)),
        mood: Number.isInteger(body.mood) && body.mood >= 1 && body.mood <= 5 ? body.mood : null,
    };

    const existing = await prisma.weeklyEntry.findUnique({
        where: { userId_weekStart: { userId: user.id, weekStart } },
    });
    let entry = await prisma.weeklyEntry.upsert({
        where: { userId_weekStart: { userId: user.id, weekStart } },
        update: data,
        create: { ...data, userId: user.id, weekStart },
    });

    if (pro) {
        const summary = await weeklySummary(entry, user);
        if (summary) entry = await prisma.weeklyEntry.update({ where: { id: entry.id }, data: { aiSummary: summary } });
    }

    const count = await prisma.weeklyEntry.count({ where: { userId: user.id } });
    await trackEvent(existing ? 'entry_updated' : 'entry_created', {
        userId: user.id,
        properties: { weekStart: weekStart.toISOString(), entryCount: count, pro },
    });

    return NextResponse.json({ entry });
}
