'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import Logo from '@/components/Logo';

const ERRORS = {
    invalid_token: 'Bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir bağlantı iste.',
    missing_token: 'Bağlantı eksik görünüyor. Yeni bir bağlantı iste.',
    system_error: 'Bir hata oluştu. Lütfen tekrar dene.',
};

function LoginForm() {
    const params = useSearchParams();
    const plan = params.get('plan');
    const next = plan ? `/app/hesap?plan=${plan}` : '/app';
    const [email, setEmail] = useState('');
    const [kvkk, setKvkk] = useState(false);
    const [state, setState] = useState({ status: 'idle', message: params.get('error') ? ERRORS[params.get('error')] : '' });

    async function submit(e) {
        e.preventDefault();
        setState({ status: 'loading' });
        const utms = {};
        ['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => params.get(k) && (utms[k] = params.get(k)));
        try {
            const res = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, next, utms, kvkkAccepted: kvkk }),
            });
            const data = await res.json();
            if (!res.ok) return setState({ status: 'idle', message: data.error });
            setState({ status: 'sent', devLink: data.devLink });
        } catch {
            setState({ status: 'idle', message: 'Bağlantı kurulamadı.' });
        }
    }

    if (state.status === 'sent') {
        return (
            <div className="text-center">
                <Mail className="mx-auto h-10 w-10 text-brand" />
                <h1 className="mt-4 text-2xl font-black">E-postanı kontrol et</h1>
                <p className="mt-2 text-slate-600">
                    <strong>{email}</strong> adresine giriş bağlantısı gönderdik. Bağlantı 48 saat geçerli.
                </p>
                {state.devLink && (
                    <a href={state.devLink} className="mt-6 block rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                        Yerel demo (SMTP yok): bağlantıya tıklayarak giriş yap →
                    </a>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <h1 className="text-2xl font-black">Arşivine giriş yap</h1>
                <p className="mt-1 text-sm text-slate-500">Şifre yok. E-postana tek kullanımlık giriş bağlantısı gönderiyoruz.</p>
            </div>
            {plan && (
                <p className="rounded-lg bg-blue-50 p-3 text-sm text-brand">
                    Giriş yaptıktan sonra Pro {plan === 'yearly' ? 'yıllık' : 'aylık'} ödeme sayfasına yönlendirileceksin.
                </p>
            )}
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="is@ornek.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
            <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 h-4 w-4" required />
                <span>
                    <a href="/kvkk" target="_blank" className="font-semibold text-brand underline">KVKK Aydınlatma Metni</a>’ni okudum, kayıtlarımın
                    raporlarımı hazırlamak için işlenmesini kabul ediyorum.
                </span>
            </label>
            {state.message && <p className="text-sm font-semibold text-red-600">{state.message}</p>}
            <button
                disabled={state.status === 'loading' || !kvkk}
                className="w-full rounded-xl bg-brand py-3.5 font-bold text-white hover:bg-brand-dark disabled:bg-slate-300"
            >
                {state.status === 'loading' ? 'Gönderiliyor…' : 'Giriş bağlantısı gönder'}
            </button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
            <div className="mb-8">
                <Logo subtitle />
            </div>
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
