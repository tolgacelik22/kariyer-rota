'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, BarChart3, Award, Briefcase, Lock, Sparkles, FileText } from 'lucide-react';
import { api, formatDate } from '@/lib/client';

const META = {
    monthly: { icon: CalendarDays, text: 'Son 4 haftanın somut çıktıları ve ölçülebilir katkıları.' },
    quarterly: { icon: BarChart3, text: 'Son çeyrek: güçlü yönler, gelişim alanları, sonraki hedefler.' },
    review: { icon: Award, text: 'Son 6 ay: yöneticiye hazır, kanıtlı performans ve terfi dosyası.' },
    stories: { icon: Briefcase, text: 'CV maddeleri ve mülakat için STAR formatında başarı hikâyeleri.' },
};

export default function ReportsPage() {
    const [me, setMe] = useState(null);
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([api('/api/me'), api('/api/reports')]).then(([m, r]) => {
            setMe(m);
            setData(r);
        });
    }, []);

    async function generate(type) {
        setBusy(type);
        setError(null);
        try {
            const { report } = await api('/api/reports', { method: 'POST', body: { type } });
            window.location.href = `/app/raporlar/${report.id}`;
        } catch (err) {
            setError(err.paywall ? { paywall: true, text: err.message } : { text: err.message });
            setBusy(null);
        }
    }

    if (!data || !me) return <p className="text-slate-500">Yükleniyor…</p>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black">Raporlar</h1>
                <p className="text-slate-500">Haftalık kayıtlarından, kanıt bağlantılarını koruyarak hazırlanır. Rakam veya proje uydurmaz.</p>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {error.text}{' '}
                    {error.paywall && <a href="/app/hesap" className="font-bold underline">Pro’ya geç →</a>}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(data.types).map(([type, def]) => {
                    const { icon: Icon, text } = META[type];
                    const locked = def.pro && !me.pro;
                    return (
                        <div key={type} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <Icon className="h-6 w-6 text-brand" />
                                {locked ? (
                                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800"><Lock className="h-3 w-3" /> Pro</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                        {me.pro ? <><Sparkles className="h-3 w-3" /> AI</> : 'Temel özet'}
                                    </span>
                                )}
                            </div>
                            <p className="mt-3 font-bold">{def.label}</p>
                            <p className="mt-1 flex-1 text-sm text-slate-600">{text}</p>
                            {locked ? (
                                <a href="/app/hesap" className="mt-4 rounded-xl border border-brand py-2.5 text-center text-sm font-bold text-brand hover:bg-blue-50">Pro ile aç</a>
                            ) : (
                                <button
                                    onClick={() => generate(type)}
                                    disabled={!!busy}
                                    className="mt-4 rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-slate-300"
                                >
                                    {busy === type ? 'Hazırlanıyor… (30 sn kadar sürebilir)' : 'Oluştur'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <section>
                <h2 className="text-lg font-bold">Oluşturulan raporlar</h2>
                <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                    {data.reports.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Henüz rapor yok.</p>}
                    {data.reports.map((r) => (
                        <a key={r.id} href={`/app/raporlar/${r.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
                            <span className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <span>
                                    <span className="block font-semibold">{data.types[r.type]?.label || r.type}</span>
                                    <span className="text-xs text-slate-500">{formatDate(r.createdAt)} · {r.entryCount} haftalık kayıt</span>
                                </span>
                            </span>
                            <span className={`text-xs font-bold ${r.source === 'ai' ? 'text-brand' : 'text-slate-400'}`}>{r.source === 'ai' ? 'AI' : 'Temel'}</span>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
