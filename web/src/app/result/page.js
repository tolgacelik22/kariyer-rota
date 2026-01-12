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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in duration-500">
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
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Lütfen mailinizi (ve gereksiz kutusunu) kontrol edin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-6 text-gray-800 font-sans">
            <div className="max-w-2xl mx-auto space-y-12">
                {/* Partial Results - VALUE FIRST */}
                <section className="space-y-8 animate-in slide-in-from-bottom duration-700">
                    <header className="space-y-2">
                        <h2 className="text-sm font-bold text-[#1f3a8a] uppercase tracking-[0.2em]">Ön Analiz Sonucu</h2>
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                            Mevcut Pozisyonunuzda "Stratejik Sıkışma" Riski Tespit Edildi.
                        </h1>
                    </header>

                    <div className="grid gap-6">
                        <div className="p-6 bg-gray-50 border-l-4 border-[#1f3a8a] space-y-2">
                            <h3 className="font-bold text-gray-900">1. Temel Tespit</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Verdiğiniz yanıtlar, tecrübe seviyenize oranla sorumluluk ve yetki dengesinin bozulduğunu göstermektedir. Bu durum uzun vadede "Kariyer Platosu" etkisine yol açabilir.
                            </p>
                        </div>

                        <div className="p-6 bg-gray-50 border-l-4 border-[#1f3a8a] space-y-2">
                            <h3 className="font-bold text-gray-900">2. İletişim Bariyeri</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Zorlandığınız konu olarak belirttiğiniz alan, genellikle üst yönetimle olan "değer kanıtlama" eksikliğinden kaynaklanmaktadır.
                            </p>
                        </div>
                    </div>
                </section>

                {/* BLURRED SECTIONS PREVIEW */}
                <div className="relative pt-8 opacity-40 select-none pointer-events-none">
                    <div className="space-y-8">
                        <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
                        <div className="h-20 bg-gray-100 w-full rounded"></div>
                        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                        <div className="h-32 bg-gray-100 w-full rounded"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
                </div>

                {/* EMAIL CAPTURE GATE */}
                <section className="bg-[#1f3a8a] text-white p-8 md:p-12 rounded-xl shadow-2xl space-y-8 text-center relative z-10 transition-transform hover:scale-[1.01]">
                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold">Raporun Tamamını Görmek İstiyor Musun?</h3>
                        <p className="text-blue-100 text-sm font-light">
                            Risk analizi, güçlü yanlar ve size özel aksiyon adımlarını içeren 12 sayfalık raporu hazırladık.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                        <input
                            type="email"
                            required
                            placeholder="E-posta adresiniz"
                            className="flex-1 px-5 py-4 rounded-md text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-white text-[#1f3a8a] rounded-md font-bold text-lg hover:bg-blue-50 transition-colors disabled:bg-gray-300"
                        >
                            {loading ? 'Hazırlanıyor...' : 'Raporu Mailime Gönder'}
                        </button>
                    </form>
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest opacity-70">
                        Tek bir tıkla raporunuza erişin. Parola gerektirmez.
                    </p>
                </section>
            </div>
        </div>
    );
}
