import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { markdownToHtml } from '@/lib/markdown';
import { REPORT_TYPES } from '@/lib/ai';
import ReportActions from '@/components/ReportActions';

export default async function ReportView({ params }) {
    const { id } = await params;
    const user = await getCurrentUser();
    const report = await prisma.report.findFirst({ where: { id, userId: user.id } });
    if (!report) notFound();

    const fmt = (d) => d.toLocaleDateString('tr-TR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
    const periodEnd = new Date(report.periodEnd.getTime() - 24 * 60 * 60 * 1000);

    return (
        <div className="space-y-6">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
                <a href="/app/raporlar" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Raporlar</a>
                <ReportActions id={report.id} content={report.content} filename={`promotly-${report.type}-${report.createdAt.toISOString().slice(0, 10)}.md`} />
            </div>
            <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">Promotly · {REPORT_TYPES[report.type]?.label}</p>
                <h1 className="mt-2 text-2xl font-black">{user.name || user.email}{user.jobTitle ? ` — ${user.jobTitle}` : ''}</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {fmt(report.periodStart)} – {fmt(periodEnd)} · {report.entryCount} haftalık kayıt · {report.source === 'ai' ? 'AI ile hazırlandı' : 'Temel özet'}
                </p>
                <div className="report-body mt-6" dangerouslySetInnerHTML={{ __html: markdownToHtml(report.content) }} />
            </article>
        </div>
    );
}
