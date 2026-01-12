'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartialResultPage() {
    const [verifyMode, setVerifyMode] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
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

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/premium/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push(data.redirect);
            } else {
                alert(data.error);
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
                            className="w-full bg-[#1f3a8a] text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-900 transition-all shadow-xl active:scale-95 disabled:bg-gray-300"
                        >
                            {downloading ? 'Hazırlanıyor...' : 'Ön Raporu PDF İndir (Ücretsiz)'}
                        </button>

                        <a
                            href={process.env.NEXT_PUBLIC_SHOPIER_URL || '#'}
                            target="_blank"
                            className="w-full bg-white border-4 border-[#1f3a8a] text-[#1f3a8a] py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all text-center block"
                        >
                            Detaylı Raporu Aç (Premium)
                        </a>
                    </div>

                    {!verifyMode ? (
                        <button
                            onClick={() => setVerifyMode(true)}
                            className="w-full text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-[#1f3a8a] transition-colors"
                        >
                            Satın aldınız mı? Buradan erişin
                        </button>
                    ) : (
                        <form onSubmit={handleVerifyEmail} className="bg-gray-50 p-6 rounded-xl space-y-4 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Premium Erişimi</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Satın aldığınız e-posta"
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#1f3a8a]"
                                    value={verifyEmail}
                                    onChange={(e) => setVerifyEmail(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Kontrol Et
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setVerifyMode(false)}
                                className="text-[10px] text-gray-400 underline"
                            >
                                Vazgeç
                            </button>
                        </form>
                    )}
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
