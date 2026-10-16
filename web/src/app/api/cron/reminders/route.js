import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMail, mailLayout } from '@/lib/mail';
import { weekStartOf } from '@/lib/week';
import { trackEvent } from '@/lib/tracking';

// Called by a scheduler (e.g. k8s CronJob) with ?secret=CRON_SECRET.
//  - Friday: "5 dakikanı ayır" reminder to users who haven't logged this week.
//  - Daily: Pro expiry heads-up 3 days before proUntil (Shopier payments don't auto-renew).
export async function GET(request) {
    const secret = new URL(request.url).searchParams.get('secret');
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL;
    const now = new Date();
    const isFriday = new Date(now.getTime() + 3 * 60 * 60 * 1000).getUTCDay() === 5;
    const result = { weekly: 0, expiry: 0, failed: 0 };

    if (isFriday || new URL(request.url).searchParams.get('force') === 'weekly') {
        const thisWeek = weekStartOf(now);
        const users = await prisma.user.findMany({
            where: {
                reminderOptIn: true,
                weeklyEntries: { some: {} },
                NOT: { weeklyEntries: { some: { weekStart: thisWeek } } },
            },
            select: { id: true, email: true, name: true },
        });
        for (const u of users) {
            try {
                await sendMail({
                    to: u.email,
                    subject: 'Cuma kaydı: bu haftayı 5 dakikada arşivle',
                    html: mailLayout(
                        `${u.name ? u.name + ', b' : 'B'}u hafta neler yaptın?`,
                        '<p>Altı ay sonra hatırlamaya çalışmak yerine bugün 5 dakika ayır. Yaptıklarını, etkisini ve kanıt bağlantılarını kaydet.</p>',
                        { href: `${base}/app`, label: 'Haftalık kaydı aç' },
                    ),
                });
                result.weekly++;
            } catch {
                result.failed++;
            }
        }
    }

    const soon = await prisma.user.findMany({
        where: {
            proUntil: {
                gte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                lt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            },
        },
        select: { id: true, email: true },
    });
    for (const u of soon) {
        try {
            await sendMail({
                to: u.email,
                subject: 'Promotly Pro üç gün içinde bitiyor',
                html: mailLayout(
                    'Pro süren bitmek üzere',
                    '<p>Kayıtların silinmez; ancak Pro bitince AI raporları ve tüm geçmiş kilitlenir. Kesintisiz devam etmek için yenileyebilirsin.</p>',
                    { href: `${base}/app/hesap`, label: 'Pro’yu yenile' },
                ),
            });
            result.expiry++;
        } catch {
            result.failed++;
        }
    }

    await trackEvent('cron_reminders', { properties: result });
    return NextResponse.json(result);
}
