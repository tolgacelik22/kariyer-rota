'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Crown, Download, Trash2, LogOut, Bell } from 'lucide-react';
import { api, formatDate } from '@/lib/client';
import { fmtTL } from '@/components/Pricing';

function AccountContent() {
    const params = useSearchParams();
    const [me, setMe] = useState(null);
    const [profile, setProfile] = useState({ name: '', jobTitle: '' });
    const [saved, setSaved] = useState(false);
    const [checkout, setCheckout] = useState(null);
    const autoStarted = useRef(false);

    useEffect(() => {
        api('/api/me').then((m) => {
            setMe(m);
            setProfile({ name: m.name || '', jobTitle: m.jobTitle || '' });
        });
    }, []);

    async function buy(plan) {
        setCheckout({ status: 'loading', plan });
        try {
            const { url, email } = await api('/api/checkout', { method: 'POST', body: { plan } });
            if (url) {
                setCheckout({ status: 'redirect', plan, email });
                window.location.href = url;
            } else {
                setCheckout({ status: 'waitlist', plan });
            }
        } catch (err) {
            setCheckout({ status: 'error', text: err.message });
        }
    }

    useEffect(() => {
        const plan = params.get('plan');
        if (me && !me.pro && (plan === 'monthly' || plan === 'yearly') && !autoStarted.current) {
            autoStarted.current = true;
            buy(plan);
        }
    }, [me, params]);

    async function saveProfile(e) {
        e.preventDefault();
        setMe(await api('/api/me', { method: 'PATCH', body: profile }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    async function toggleReminder() {
        setMe(await api('/api/me', { method: 'PATCH', body: { reminderOptIn: !me.reminderOptIn } }));
    }

    async function deleteAccount() {
        const typed = prompt('Hesabın ve TÜM kayıtların kalıcı olarak silinecek. Onaylamak için SİL yaz:');
        if (typed?.trim().toLocaleUpperCase('tr-TR') !== 'SİL') return;
        await api('/api/me', { method: 'DELETE' });
        window.location.href = '/';
    }

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    }

    if (!me) return <p className="text-slate-500">Yükleniyor…</p>;
    const discount = Math.round((1 - me.prices.yearly / (me.prices.monthly * 12)) * 100);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black">Hesap</h1>

            <Card title="Plan" icon={Crown}>
                {me.pro ? (
                    <p className="text-slate-700">
                        <strong className="text-brand">Pro {me.proPlan === 'yearly' ? 'yıllık' : 'aylık'}</strong> aktif ·{' '}
                        {formatDate(me.proUntil)} tarihine kadar. Yenileme otomatik değildir; bitmeden 3 gün önce e-posta ile hatırlatırız.
                    </p>
                ) : (
                    <p className="text-slate-700">Ücretsiz plandasın. Pro ile AI haftalık özetleri, çeyrek analizi, 6 aylık terfi dosyası ve tüm geçmişin açılır.</p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button onClick={() => buy('monthly')} disabled={checkout?.status === 'loading'} className="rounded-xl bg-brand p-4 text-left text-white hover:bg-brand-dark">
                        <span className="block text-xs font-bold uppercase tracking-widest text-blue-200">{me.pro ? 'Bir ay uzat' : 'Pro aylık'}</span>
                        <span className="text-2xl font-black">{fmtTL(me.prices.monthly)}</span><span className="text-blue-200">/ay</span>
                    </button>
                    <button onClick={() => buy('yearly')} disabled={checkout?.status === 'loading'} className="rounded-xl border-2 border-brand p-4 text-left text-brand hover:bg-blue-50">
                        <span className="block text-xs font-bold uppercase tracking-widest">{me.pro ? 'Bir yıl uzat' : 'Pro yıllık'} · ~%{discount} indirim</span>
                        <span className="text-2xl font-black">{fmtTL(me.prices.yearly)}</span><span>/yıl</span>
                    </button>
                </div>
                {checkout?.status === 'redirect' && (
                    <p className="mt-3 text-sm text-slate-600">Shopier ödeme sayfasına yönlendiriliyorsun. Ödemede <strong>{checkout.email}</strong> adresini kullan; Pro otomatik açılır.</p>
                )}
                {checkout?.status === 'waitlist' && (
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        Teşekkürler! Pro ödemeleri çok yakında açılıyor; ilgini kaydettik ve açıldığında ilk sana haber vereceğiz.
                    </p>
                )}
                {checkout?.status === 'error' && <p className="mt-3 text-sm text-red-600">{checkout.text}</p>}
            </Card>

            <Card title="Profil">
                <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                        Ad
                        <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal" />
                    </label>
                    <label className="text-sm font-semibold">
                        Pozisyon
                        <input value={profile.jobTitle} onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} placeholder="Kıdemli Yazılım Mühendisi" className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal" />
                    </label>
                    <div className="flex items-center gap-3 sm:col-span-2">
                        <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Kaydet</button>
                        {saved && <span className="text-sm text-emerald-600">Kaydedildi</span>}
                        <span className="ml-auto text-sm text-slate-500">{me.email}</span>
                    </div>
                </form>
            </Card>

            <Card title="Cuma hatırlatması" icon={Bell}>
                <label className="flex cursor-pointer items-center gap-3 text-slate-700">
                    <input type="checkbox" checked={me.reminderOptIn} onChange={toggleReminder} className="h-5 w-5" />
                    Bu hafta kayıt eklemediysem cuma günü e-posta ile hatırlat.
                </label>
            </Card>

            <Card title="Verilerin" icon={Download}>
                <p className="text-sm text-slate-600">Arşivin sana ait. İstediğin an indir ya da tamamen sil.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <a href="/api/export?format=md" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">Markdown indir</a>
                    <a href="/api/export?format=json" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">JSON indir</a>
                    <button onClick={deleteAccount} className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Hesabı ve tüm verileri sil
                    </button>
                </div>
            </Card>

            <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
                <LogOut className="h-4 w-4" /> Çıkış yap
            </button>
        </div>
    );
}

function Card({ title, icon: Icon, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold">
                {Icon && <Icon className="h-5 w-5 text-brand" />} {title}
            </h2>
            {children}
        </section>
    );
}

export default function AccountPage() {
    return (
        <Suspense fallback={null}>
            <AccountContent />
        </Suspense>
    );
}
