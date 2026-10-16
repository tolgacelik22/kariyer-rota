'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flame, CalendarCheck, Lock, Sparkles, Link2, Trash2, Pencil, Gift } from 'lucide-react';
import { api, formatWeekClient } from '@/lib/client';

const EMPTY = { wins: '', impact: '', challenges: '', learnings: '', nextWeek: '', tags: '', links: '', mood: null };
const MOODS = ['😣', '😕', '😐', '🙂', '🤩'];

function toForm(entry) {
    if (!entry) return EMPTY;
    return {
        wins: entry.wins || '',
        impact: entry.impact || '',
        challenges: entry.challenges || '',
        learnings: entry.learnings || '',
        nextWeek: entry.nextWeek || '',
        tags: (entry.tags || []).join(', '),
        links: (entry.links || []).join('\n'),
        mood: entry.mood,
    };
}

export default function WeeklyPage() {
    const [me, setMe] = useState(null);
    const [data, setData] = useState(null);
    const [week, setWeek] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const load = useCallback(async () => {
        const [meRes, entriesRes] = await Promise.all([api('/api/me'), api('/api/entries')]);
        setMe(meRes);
        setData(entriesRes);
        return entriesRes;
    }, []);

    useEffect(() => {
        load().then((d) => {
            setWeek(d.currentWeek);
            setForm(toForm(d.entries.find((e) => e.weekStart === d.currentWeek)));
        });
    }, [load]);

    const weekOptions = useMemo(() => {
        if (!data) return [];
        const base = new Date(data.currentWeek).getTime();
        return Array.from({ length: data.backfillWeeks + 1 }, (_, i) => new Date(base - i * 7 * 86400000).toISOString());
    }, [data]);

    function pickWeek(w) {
        setWeek(w);
        setMessage(null);
        setForm(toForm(data.entries.find((e) => e.weekStart === w && !e.locked)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const { entry } = await api('/api/entries', {
                method: 'PUT',
                body: {
                    weekStart: week,
                    ...form,
                    tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
                    links: form.links.split(/\s+/).map((s) => s.trim()).filter(Boolean),
                },
            });
            await load();
            setMessage({ type: 'ok', text: 'Kaydedildi. Bu hafta arşivde.', summary: entry.aiSummary });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    }

    async function remove(id) {
        if (!confirm('Bu haftalık kaydı silmek istediğine emin misin?')) return;
        await api(`/api/entries/${id}`, { method: 'DELETE' });
        const d = await load();
        if (!d.entries.find((e) => e.weekStart === week)) setForm(EMPTY);
    }

    if (!data || !me) return <p className="text-slate-500">Yükleniyor…</p>;

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const isCurrent = week === data.currentWeek;

    return (
        <div className="space-y-8">
            <section className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Merhaba{me.name ? `, ${me.name}` : ''} 👋</h1>
                    <p className="text-slate-500">
                        {data.stats.loggedThisWeek ? 'Bu haftanın kaydı tamam. İstersen güncelleyebilirsin.' : 'Bu haftayı 5 dakikada arşivle.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Stat icon={Flame} label="Hafta serisi" value={data.stats.streak} accent />
                    <Stat icon={CalendarCheck} label="Toplam kayıt" value={data.stats.total} />
                </div>
            </section>

            {data.stats.showOffer && (
                <a href="/app/hesap" className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-brand to-blue-700 p-5 text-white shadow-lg">
                    <Gift className="h-8 w-8 shrink-0 text-amber-300" />
                    <div>
                        <p className="font-bold">{data.stats.total} haftadır düzenli kayıt tutuyorsun 🎉</p>
                        <p className="text-sm text-blue-100">
                            Artık AI performans dosyanı çıkaracak kadar verin var. Pro’ya geç, ilk raporunu hemen oluştur →
                        </p>
                    </div>
                </a>
            )}

            <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">{isCurrent ? 'Bu haftanın kaydı' : 'Geçmiş hafta kaydı'}</h2>
                    <select
                        value={week || ''}
                        onChange={(e) => pickWeek(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                        {weekOptions.map((w, i) => (
                            <option key={w} value={w}>
                                {i === 0 ? 'Bu hafta' : i === 1 ? 'Geçen hafta' : `${i} hafta önce`} · {formatWeekClient(w)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 grid gap-5">
                    <Area label="Bu hafta neler yaptın?" hint="Tamamlanan işler, teslimler, aldığın kararlar. Her satır bir madde." value={form.wins} onChange={set('wins')} rows={4} required />
                    <Area label="Etkisi ne oldu?" hint="Ölçülebilir sonuçlar: %, süre, tutar, adet, kullanıcı. “%30 hızlandı” gibi." value={form.impact} onChange={set('impact')} />
                    <div className="grid gap-5 md:grid-cols-2">
                        <Area label="Zorluklar / engeller" value={form.challenges} onChange={set('challenges')} rows={2} />
                        <Area label="Öğrendiklerin" value={form.learnings} onChange={set('learnings')} rows={2} />
                    </div>
                    <Area label="Gelecek hafta odak" value={form.nextWeek} onChange={set('nextWeek')} rows={2} />
                    <div className="grid gap-5 md:grid-cols-2">
                        <Input label="Etiketler" hint="Proje / yetkinlik, virgülle: ödeme, liderlik" value={form.tags} onChange={set('tags')} />
                        <Area label="Kanıt bağlantıları" hint="Jira, GitHub, doküman linkleri (her satıra bir tane)" value={form.links} onChange={set('links')} rows={2} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Hafta nasıl geçti?</p>
                        <div className="mt-2 flex gap-2">
                            {MOODS.map((m, i) => (
                                <button
                                    type="button"
                                    key={m}
                                    onClick={() => setForm((f) => ({ ...f, mood: f.mood === i + 1 ? null : i + 1 }))}
                                    className={`rounded-xl border px-3 py-2 text-xl ${form.mood === i + 1 ? 'border-brand bg-blue-50' : 'border-slate-200'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                        🔒 Gizli şirket bilgisi (müşteri adı, kod, iç rakamlar) yazma; “büyük bir müşteri”, “%30” gibi genellemeler yeterli.
                    </p>
                </div>

                {message && (
                    <div className={`mt-5 rounded-xl p-4 text-sm ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                        <p className="font-semibold">{message.text}</p>
                        {message.summary && (
                            <div className="mt-3 rounded-lg bg-white p-3 text-slate-700">
                                <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand">
                                    <Sparkles className="h-3.5 w-3.5" /> AI haftalık özet
                                </p>
                                <p className="whitespace-pre-line">{message.summary}</p>
                            </div>
                        )}
                        {message.type === 'ok' && !me.pro && (
                            <p className="mt-2 text-xs">Pro’da her kayda yöneticine iletebileceğin AI özeti otomatik eklenir.</p>
                        )}
                    </div>
                )}

                <button disabled={saving} className="mt-6 w-full rounded-xl bg-brand py-3.5 font-bold text-white hover:bg-brand-dark disabled:bg-slate-300 md:w-auto md:px-10">
                    {saving ? (me.pro ? 'Kaydediliyor, AI özet hazırlanıyor…' : 'Kaydediliyor…') : 'Kaydet'}
                </button>
            </form>

            <section>
                <h2 className="text-lg font-bold">Arşiv</h2>
                {data.historyLimitWeeks && (
                    <p className="text-sm text-slate-500">Ücretsiz planda son {data.historyLimitWeeks} hafta görünür; eski kayıtların silinmez, Pro’da açılır.</p>
                )}
                <div className="mt-4 space-y-3">
                    {data.entries.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Henüz kayıt yok. İlk haftanı yukarıdan ekle.</p>}
                    {data.entries.map((e) =>
                        e.locked ? (
                            <a key={e.id} href="/app/hesap" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 p-4 text-slate-400">
                                <span className="font-semibold">{formatWeekClient(e.weekStart)}</span>
                                <span className="flex items-center gap-1 text-xs font-bold"><Lock className="h-3.5 w-3.5" /> Pro ile aç</span>
                            </a>
                        ) : (
                            <EntryCard key={e.id} entry={e} onEdit={() => pickWeek(e.weekStart)} onDelete={() => remove(e.id)} canEdit={weekOptions.includes(e.weekStart)} />
                        ),
                    )}
                </div>
            </section>
        </div>
    );
}

function EntryCard({ entry, onEdit, onDelete, canEdit }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-brand">
                    {formatWeekClient(entry.weekStart)} {entry.mood ? MOODS[entry.mood - 1] : ''}
                </p>
                <div className="flex gap-1 text-slate-400">
                    {canEdit && (
                        <button onClick={onEdit} title="Düzenle" className="rounded p-1.5 hover:bg-slate-100 hover:text-slate-700"><Pencil className="h-4 w-4" /></button>
                    )}
                    <button onClick={onDelete} title="Sil" className="rounded p-1.5 hover:bg-slate-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{entry.wins}</p>
            {entry.impact && <p className="mt-2 whitespace-pre-line text-sm text-emerald-700">↗ {entry.impact}</p>}
            {entry.aiSummary && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
                    <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand"><Sparkles className="h-3.5 w-3.5" /> AI özet</p>
                    <p className="whitespace-pre-line">{entry.aiSummary}</p>
                </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {entry.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">#{t}</span>)}
                {entry.links.map((l) => (
                    <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-brand">
                        <Link2 className="h-3 w-3" /> {l.replace(/^https?:\/\//, '').slice(0, 40)}
                    </a>
                ))}
            </div>
        </article>
    );
}

function Stat({ icon: Icon, label, value, accent }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Icon className={`h-5 w-5 ${accent ? 'text-orange-500' : 'text-brand'}`} />
            <div>
                <p className="text-xl font-black leading-none">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </div>
    );
}

function Area({ label, hint, rows = 3, ...props }) {
    return (
        <label className="block">
            <span className="text-sm font-semibold">{label}{props.required && <span className="text-red-500"> *</span>}</span>
            {hint && <span className="block text-xs text-slate-400">{hint}</span>}
            <textarea rows={rows} {...props} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" />
        </label>
    );
}

function Input({ label, hint, ...props }) {
    return (
        <label className="block">
            <span className="text-sm font-semibold">{label}</span>
            {hint && <span className="block text-xs text-slate-400">{hint}</span>}
            <input {...props} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" />
        </label>
    );
}
