'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartialResultPage() {
    const [verifyMode, setVerifyMode] = useState(false);
    const [email, setEmail] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [surveyId, setSurveyId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const id = localStorage.getItem('survey_id');
        if (!id) {
            router.push('/');
        } else {
            setSurveyId(id);
        }
    }, [router]);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const answers = JSON.parse(localStorage.getItem('last_answers') || '{}');
            const res = await fetch('/api/report/free-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'kariyer-on-rapor.pdf';
                a.click();
            }
        } catch (e) {
            alert('PDF oluşturulamadı.');
        } finally {
            setDownloading(false);
        }
    };

    const handleVerifyPremium = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch('/api/premium/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                router.push(`/report?id=${surveyId}`);
            } else {
                alert(data.reason === 'not_found'
                    ? 'Bu e-posta ile bir satın alma bulunamadı. Lütfen Shopier’de kullandığınız e-posta ile tekrar deneyin.'
                    : 'Doğrulama sırasında bir hata oluştu.');
            }
        } catch (err) {
            alert('Sistem hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-12 px-6 text-gray-800 font-sans">
            <div className="max-w-xl mx-auto space-y-16">
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

                <section className="space-y-6">
                    <div className="grid gap-4">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="w-full bg-white border-4 border-gray-100 text-gray-400 py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all active:scale-95 disabled:bg-gray-50"
                        >
                            {downloading ? 'Hazırlanıyor...' : 'Ön Raporu PDF İndir (Ücretsiz)'}
                        </button>

                        <div className="bg-[#1f3a8a] p-8 rounded-2xl shadow-2xl space-y-6">
                            <h2 className="text-white text-xl font-black tracking-tight leading-tight">
                                Detaylı Analiz & 90 Günlük Aksiyon Planı
                            </h2>
                            <p className="text-blue-100/70 text-sm leading-relaxed">
                                Hangi hataları yaptığınızı, üst yönetimle nasıl konuşmanız gerektiğini ve adım adım 90 günlük planınızı hemen görün.
                            </p>

                            {!verifyMode ? (
                                <div className="space-y-3 pt-2">
                                    <a
                                        href="/api/payment/shopier"
                                        target="_blank"
                                        className="w-full bg-white text-[#1f3a8a] py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-lg transition-all text-center block"
                                    >
                                        Detaylı Raporu Aç (₺299)
                                    </a>
                                    <button
                                        onClick={() => setVerifyMode(true)}
                                        className="w-full text-[10px] text-blue-200/50 font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
                                    >
                                        Satın Aldım, Premium'u Aç
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleVerifyPremium} className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1">
                                        <input
                                            type="email"
                                            required
                                            placeholder="Ödeme e-postanızı girin"
                                            className="w-full px-5 py-4 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <p className="text-[10px] text-blue-200/50 italic px-1">
                                            * Shopier'de kullandığınız e-posta ile aynı olmalı.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setVerifyMode(false)}
                                            className="bg-blue-800 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                                        >
                                            Geri Dön
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-white text-[#1f3a8a] py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Kontrol Ediliyor...' : 'Doğrula ve Aç'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                <div className="space-y-12 opacity-50 select-none pointer-events-none relative overflow-hidden pt-8">
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
