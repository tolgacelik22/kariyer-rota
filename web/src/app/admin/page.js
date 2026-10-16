import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { weekStartOf, weeksBetween } from '@/lib/week';
import { pricesFor } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }) {
    const params = await searchParams;
    const token = params.token;

    if (token !== process.env.ADMIN_TOKEN) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-8 bg-white shadow-sm border border-gray-100 rounded-md">
                    <h1 className="text-xl font-bold mb-4">Admin Access Required</h1>
                    <p className="text-gray-500 text-sm">Please provide a valid token in the URL.</p>
                </div>
            </div>
        );
    }

    // Fetch Stats
    const [
        userCount,
        premiumCount,
        surveyCount,
        eventCount,
        recentEvents,
        recentOrders
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isPremium: true } }),
        prisma.surveyResult.count(),
        prisma.event.count(),
        prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: true } }),
        prisma.shopierOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: true } }),
    ]);

    const convRate = userCount > 0 ? ((premiumCount / userCount) * 100).toFixed(1) : 0;
    const promotly = await promotlyStats();

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex justify-between items-end">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Kariyer Rota Admin</h1>
                    <div className="text-right text-xs font-mono text-gray-400">
                        System Live | {new Date().toISOString()}
                    </div>
                </header>

                {/* Promotly: habit + willingness to pay */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold uppercase tracking-widest">Promotly</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                        <StatCard label="Kayıt tutan" value={promotly.loggers} />
                        <StatCard label="Bu hafta kayıt" value={promotly.thisWeek} />
                        <StatCard label="6. hafta tutunma" value={promotly.week6} highlight />
                        <StatCard label="Aktif Pro" value={promotly.activePro} highlight />
                        <StatCard label="MRR (tahmini)" value={`${promotly.mrr.toLocaleString('tr-TR')} TL`} />
                        <StatCard label="Rapor" value={promotly.reports} />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="p-4">Fiyat varyantı (aylık)</th>
                                    <th className="p-4">Kullanıcı</th>
                                    <th className="p-4">Ödeme tıklaması</th>
                                    <th className="p-4">Satın alma</th>
                                    <th className="p-4">Dönüşüm</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {promotly.variants.map((v) => (
                                    <tr key={v.variant}>
                                        <td className="p-4 font-bold">{v.variant} TL</td>
                                        <td className="p-4">{v.users}</td>
                                        <td className="p-4">{v.clicks}</td>
                                        <td className="p-4">{v.purchases}</td>
                                        <td className="p-4">{v.users ? ((v.purchases / v.users) * 100).toFixed(1) : 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400">
                        6. hafta tutunma: ilk kaydı en az 6 hafta önce olan kullanıcılardan 6. haftasında veya sonrasında hâlâ kayıt girenlerin oranı ({promotly.week6Base} kişi).
                    </p>
                </section>

                {/* Totals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard label="Total Users" value={userCount} />
                    <StatCard label="Premium Users" value={premiumCount} highlight />
                    <StatCard label="Analyses" value={surveyCount} />
                    <StatCard label="Conversion" value={`${convRate}%`} />
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Recent Orders */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold uppercase tracking-widest">Recent Orders</h2>
                        <div className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.map(o => (
                                        <tr key={o.id}>
                                            <td className="p-4 font-mono text-[10px]">{o.orderId}</td>
                                            <td className="p-4">{o.email || o.user?.email || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Recent Events */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold uppercase tracking-widest">Live Events</h2>
                        <div className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Email/User</th>
                                        <th className="p-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentEvents.map(e => (
                                        <tr key={e.id}>
                                            <td className="p-4 font-bold text-[#1f3a8a]">{e.name}</td>
                                            <td className="p-4 text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                {e.email || e.user?.email || 'Anonymous'}
                                            </td>
                                            <td className="p-4 text-gray-400 text-xs">{new Date(e.createdAt).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

async function promotlyStats() {
    const thisWeek = weekStartOf();
    const [entries, proUsers, reports, users, events] = await Promise.all([
        prisma.weeklyEntry.findMany({ select: { userId: true, weekStart: true } }),
        prisma.user.findMany({ where: { proUntil: { gt: new Date() } }, select: { proPlan: true, priceVariant: true } }),
        prisma.report.count(),
        prisma.user.groupBy({ by: ['priceVariant'], _count: true }),
        prisma.event.findMany({ where: { name: { in: ['checkout_clicked', 'pro_purchase_success'] } }, select: { name: true, properties: true } }),
    ]);

    const byUser = {};
    for (const e of entries) (byUser[e.userId] ||= []).push(new Date(e.weekStart));
    let week6Base = 0;
    let week6Kept = 0;
    for (const weeks of Object.values(byUser)) {
        const first = new Date(Math.min(...weeks));
        if (weeksBetween(first, thisWeek) < 5) continue;
        week6Base++;
        if (weeks.some((w) => weeksBetween(first, w) >= 5)) week6Kept++;
    }

    const mrr = proUsers.reduce((sum, u) => {
        const p = pricesFor(u.priceVariant);
        return sum + (u.proPlan === 'yearly' ? p.yearly / 12 : p.monthly);
    }, 0);

    const variants = {};
    const row = (v) => (variants[v] ||= { variant: v, users: 0, clicks: 0, purchases: 0 });
    for (const u of users) if (u.priceVariant) row(u.priceVariant).users += u._count;
    for (const ev of events) {
        const v = ev.properties?.variant;
        if (!v) continue;
        if (ev.name === 'checkout_clicked') row(v).clicks++;
        else row(v).purchases++;
    }

    return {
        loggers: Object.keys(byUser).length,
        thisWeek: entries.filter((e) => new Date(e.weekStart).getTime() === thisWeek.getTime()).length,
        week6: week6Base ? `${Math.round((week6Kept / week6Base) * 100)}%` : '—',
        week6Base,
        activePro: proUsers.length,
        mrr: Math.round(mrr),
        reports,
        variants: Object.values(variants).sort((a, b) => Number(a.variant) - Number(b.variant)),
    };
}

function StatCard({ label, value, highlight = false }) {
    return (
        <div className={`p-6 bg-white border border-gray-100 rounded-md shadow-sm ${highlight ? 'ring-2 ring-[#1f3a8a] ring-inset' : ''}`}>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-black ${highlight ? 'text-[#1f3a8a]' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
}
