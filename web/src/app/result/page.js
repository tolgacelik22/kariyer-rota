'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartialResultPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [surveyId, setSurveyId] = useState(null);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const id = localStorage.getItem('survey_id');
        if (!id) {
            router.push('/');
        } else {
            setSurveyId(id);
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const utms = JSON.parse(localStorage.getItem('utms') || '{}');
            const res = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, surveyId, utms }),
            });

            if (res.ok) {
                setSent(true);
            } else {
                alert('E-posta gönderilemedi. Lütfen adresi kontrol edin.');
            }
        } catch (err) {
            console.error(err);
            alert('Sistem hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in duration-500 font-sans">
                <div className="w-20 h-20 bg-blue-50 text-[#1f3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">Giriş Bağlantısı Gönderildi</h2>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Raporunuzu güvenli bir şekilde görüntülemeniz için <strong>{email}</strong> adresine bir sihirli bağlantı gönderdik.
                </p>
                <div className="pt-4">
                    <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Lütfen mailinizi (ve gereksiz kutusunu) kontrol edin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-6 text-gray-800 font-sans">
            <div className="max-w-xl mx-auto space-y-16">
                {/* Header Area */}
                <header className="space-y-4 animate-in fade-in duration-700">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ön Analiz Sonucu</p>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
                            Mevcut Pozisyonunuzda "Stratejik Sıkışma" Riski Tespit Edildi.
                        </h1>
                        <p className="text-gray-600 font-medium text-lg leading-snug">
                            Bu durum maaş artışı ve terfi görüşmelerinde sistematik kayıp yaratır.
                        </p>
                    </div>
                </header>

                {/* Free Insight Area (2 Items - Compact) */}
                <section className="grid gap-4 animate-in slide-in-from-bottom-4 duration-700">
                    <div className="p-5 bg-gray-50 border-l-2 border-[#1f3a8a] space-y-1">
                        <h3 className="font-bold text-gray-900 text-sm">1. Temel Tespit</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğu görülmektedir. <span className="text-gray-900 font-medium italic underline decoration-gray-200">Bu durum piyasa değerinizi baskılayan bir plato etkisi yaratır.</span>
                        </p>
                    </div>

                    <div className="p-5 bg-gray-50 border-l-2 border-[#1f3a8a] space-y-1">
                        <h3 className="font-bold text-gray-900 text-sm">2. İletişim Bariyeri</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Zorlandığınız konu, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden gelmektedir. <span className="text-gray-900 font-medium italic underline decoration-gray-200">Görünür olmayan başarı, müzakere masasında argüman kaybına neden olur.</span>
                        </p>
                    </div>
                </section>

                {/* EMAIL CAPTURE GATE (Promoted Higher) */}
                <section className="bg-white border-4 border-[#1f3a8a] p-8 md:p-10 rounded-2xl shadow-xl space-y-8 text-center animate-in zoom-in duration-500 ring-4 ring-blue-50/50">
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Detaylı Raporun Kilidini Aç</h3>
                        <p className="text-gray-500 text-sm font-medium">
                            Raporunuz hazır. Tek tıkla, şifresiz erişin.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                        <input
                            type="email"
                            required
                            placeholder="E-posta adresiniz"
                            className="flex-1 px-5 py-4 rounded-lg bg-gray-50 text-gray-900 text-base border-2 border-gray-100 focus:outline-none focus:border-[#1f3a8a] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-[#1f3a8a] text-white rounded-lg font-black uppercase tracking-widest text-sm hover:bg-blue-900 transition-all shadow-md active:scale-95 disabled:bg-gray-300"
                        >
                            {loading ? 'Hazırlanıyor...' : 'Raporu Aç'}
                        </button>
                    </form>
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Spam yok. Satın alma zorunlu değil.
                        </p>
                    </div>
                </section>

                {/* BLURRED SECTIONS START */}
                <div className="space-y-12 opacity-50 select-none pointer-events-none relative overflow-hidden">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Yanlış Yapılan Kritik Noktalar</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-100 w-full rounded blur-[4px]"></div>
                            <div className="h-4 bg-gray-100 w-5/6 rounded blur-[5px]"></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Üst Yönetimle Konuşma Stratejisi</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-100 w-full rounded blur-[6px]"></div>
                            <div className="h-4 bg-gray-100 w-4/6 rounded blur-[5px]"></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">90 Günlük Net Aksiyon Planı</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-100 w-full rounded blur-[5px]"></div>
                            <div className="h-4 bg-gray-100 w-3/4 rounded blur-[7px]"></div>
                        </div>
                    </div>

                    {/* Gradient Overlay to Fade Out */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                <footer className="text-center pt-8 border-t border-gray-50">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        Model A — Karar Destek Algoritması
                    </p>
                </footer>
            </div>
        </div>
    );
}
