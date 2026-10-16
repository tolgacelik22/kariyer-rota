import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/api';
import { formatWeek } from '@/lib/week';
import { REPORT_TYPES } from '@/lib/ai';

// Full data export (KVKK: the user owns and can take their data). Never paywalled.
export async function GET(request) {
    const { user, error } = await requireUser();
    if (error) return error;

    const format = new URL(request.url).searchParams.get('format') === 'md' ? 'md' : 'json';
    const [entries, reports] = await Promise.all([
        prisma.weeklyEntry.findMany({ where: { userId: user.id }, orderBy: { weekStart: 'asc' } }),
        prisma.report.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }),
    ]);
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
        const body = JSON.stringify(
            {
                exportedAt: new Date().toISOString(),
                profile: { email: user.email, name: user.name, jobTitle: user.jobTitle, createdAt: user.createdAt },
                entries,
                reports,
            },
            null,
            2,
        );
        return new Response(body, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="promotly-${stamp}.json"`,
            },
        });
    }

    const parts = [`# Promotly arşivi — ${user.name || user.email}`, `_Dışa aktarım: ${stamp}_`, '## Haftalık kayıtlar'];
    for (const e of entries) {
        parts.push(`### ${formatWeek(e.weekStart)}`);
        parts.push(`**Yapılanlar:**\n${e.wins}`);
        if (e.impact) parts.push(`**Etki:**\n${e.impact}`);
        if (e.challenges) parts.push(`**Zorluklar:**\n${e.challenges}`);
        if (e.learnings) parts.push(`**Öğrenilenler:**\n${e.learnings}`);
        if (e.nextWeek) parts.push(`**Gelecek hafta:**\n${e.nextWeek}`);
        if (e.tags.length) parts.push(`**Etiketler:** ${e.tags.join(', ')}`);
        if (e.links.length) parts.push(`**Kanıtlar:**\n${e.links.map((l) => `- ${l}`).join('\n')}`);
    }
    if (reports.length) {
        parts.push('## Raporlar');
        for (const r of reports) {
            parts.push(`### ${REPORT_TYPES[r.type]?.label || r.type} — ${r.createdAt.toISOString().slice(0, 10)}`, r.content);
        }
    }
    return new Response(parts.join('\n\n'), {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="promotly-${stamp}.md"`,
        },
    });
}
