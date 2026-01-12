'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportClient({ user, survey, isPremium: initialPremium }) {
    const [isPremium, setIsPremium] = useState(initialPremium);
    const [verifying, setVerifying] = useState(false);
    const [pollTimeout, setPollTimeout] = useState(false);
    const [verifyMode, setVerifyMode] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/premium/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyEmail }),
            });
            if (res.ok) {
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            alert('Sistem hatası.');
        }
    };

    useEffect(() => {
        if (isPremium) return;

        let interval;
        const checkPremium = async () => {
            try {
                const res = await fetch('/api/shopier/verify');
                const data = await res.json();
                if (data.isPremium) {
                    setIsPremium(true);
                    setVerifying(false);
                    clearInterval(interval);
                }
            } catch (e) { }
        };

        // Check after return from payment
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('check') === 'true') {
            setVerifying(true);
            interval = setInterval(checkPremium, 3000);

            // Timeout after 120s (2 minutes)
            setTimeout(() => {
                clearInterval(interval);
                setVerifying(false);
                setPollTimeout(true);
            }, 120000);
        }

        return () => clearInterval(interval);
    }, [isPremium]);

    const handlePayClick = () => {
        fetch('/api/track', {
            method: 'POST',
            body: JSON.stringify({
                name: 'paywall_clicked',
                userId: user.id,
                email: user.email,
                properties: { price: 299 }
            })
        }).catch(() => { });
    };

    return (
        <div className="min-h-screen bg-white py-12 px-6 text-gray-800 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-20">
                {/* Professional Header */}
                <div className="border-b-4 border-gray-900 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
                            Stratejik Kariyer <br />Analiz Raporu
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">
                            Kişiye Özel Profesyonel Değerlendirme
                        </p>
                    </div>
                    <div className="text-left md:text-right font-mono text-xs text-gray-400 border-l md:border-l-0 md:border-r border-gray-100 pl-4 md:pl-0 md:pr-4">
                        <p>ID: {user?.id?.slice(0, 12)}</p>
                        <p>Tarih: {new Date(survey?.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
                        <p className="mt-2 text-[#1f3a8a] font-bold uppercase tracking-widest leading-relaxed">
                            {isPremium ? 'Sürüm: Full Enterprise' : 'Sürüm: Standard (Kısıtlı)'}
                        </p>
                    </div>
                </div>

                {/* Section 1: Executive Summary (ALWAYS VISIBLE) */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-gray-200">01</span>
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#1f3a8a]">Genel Durum Özeti</h2>
                    </div>
                    <div className="space-y-6 text-xl leading-relaxed text-gray-700 font-serif border-l-8 border-gray-50 pl-8">
                        <p>
                            Mevcut verileriniz, profesyonel kariyerinizde "etkin yetkinlik" aşamasına ulaştığınızı ancak bu yetkinliğin <strong>"{survey?.rawAnswers?.concern || 'fırsat'}"</strong> ekseninde nakde veya statüye dönüştürülmesinde %{100 - (survey?.score || 60)} oranında bir verimlilik kaybı yaşadığınızı göstermektedir.
                        </p>
                        <p>
                            Analizimiz, kariyer yolculuğunuzda en çok zorlandığınız <u>"{survey?.rawAnswers?.difficulty}"</u> konusunun, bireysel performansınızdan ziyade mevcut kurumsal yapınızdaki "stratejik görünürlük" eksikliğinden kaynaklandığını doğrulamaktadır.
                        </p>
                    </div>
                </section>

                {/* Section 2: Core Insights (ALWAYS VISIBLE - ~40% mark) */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-gray-200">02</span>
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#1f3a8a]">Öne Çıkan Tespitler</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-gray-50 rounded-lg space-y-4 border border-gray-100">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 text-sm uppercase">Piyasa Konumlanması</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Kıdem seviyeniz ({survey?.rawAnswers?.seniority}) ve tecrübe süreniz ({survey?.rawAnswers?.experience}) dikkate alındığında, benzer rollerdeki lider %20'lik dilimle aranızda belirgin bir "risk toleransı" farkı bulunmaktadır.
                            </p>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-lg space-y-4 border border-gray-100">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 text-sm uppercase">Psikolojik Eşik</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Atılganlık puanınız ({survey?.rawAnswers?.risk_tolerance}/10), müzakere masasında "ilk teklifi yapan taraf" olma konusunda çekinceleriniz olduğunu, bu durumun da potansiyel maaş artışlarını baskıladığını göstermektedir.
                            </p>
                        </div>
                    </div>
                </section>

                {/* BLURRED CONTENT / PAYWALL START */}
                <div className="relative">
                    {!isPremium && (
                        <div className="absolute inset-x-0 -top-10 bottom-0 z-20 flex flex-col items-center justify-start pt-32 px-6">
                            <div className="sticky top-40 w-full max-w-lg bg-white p-10 border-4 border-[#1f3a8a] shadow-[0_30px_60px_rgba(31,58,138,0.35)] space-y-8 text-center rounded-2xl animate-in zoom-in duration-300">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900">Premium ile Tamamını Aç</h3>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Kariyer stratejinizin kritik final bölümleri kilitli.
                                    </p>
                                </div>

                                <div className="space-y-4 text-left border-y border-gray-100 py-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-700 font-bold leading-relaxed">
                                        <span className="text-[#1f3a8a]">✓</span>
                                        <span>Yanlış Yapılan Kritik Noktalar</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700 font-bold leading-relaxed">
                                        <span className="text-[#1f3a8a]">✓</span>
                                        <span>Üst Yönetimle Konuşma Stratejisi</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700 font-bold leading-relaxed">
                                        <span className="text-[#1f3a8a]">✓</span>
                                        <span>90 Günlük Net Aksiyon Planı</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {verifying ? (
                                        <div className="p-4 bg-blue-50 text-[#1f3a8a] rounded-lg animate-pulse font-bold border-2 border-[#1f3a8a]/20">
                                            Ödemeniz doğrulanıyor, lütfen bekleyin...
                                        </div>
                                    ) : (
                                        <>
                                            <Link
                                                onClick={handlePayClick}
                                                href={`/api/payment/shopier?userId=${user?.id}`}
                                                className="block w-full bg-[#1f3a8a] text-white py-5 rounded-lg font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 text-lg"
                                            >
                                                Tamamını Aç (₺299)
                                            </Link>

                                            <button
                                                onClick={() => setVerifyMode(true)}
                                                className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-[#1f3a8a] py-2"
                                            >
                                                Zaten satın aldınız mı?
                                            </button>

                                            {verifyMode && (
                                                <form onSubmit={handleVerifyEmail} className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100 mt-2">
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="Satın aldığınız e-posta"
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#1f3a8a]"
                                                        value={verifyEmail}
                                                        onChange={(e) => setVerifyEmail(e.target.value)}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="w-full bg-gray-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest"
                                                    >
                                                        Raporu Aç
                                                    </button>
                                                </form>
                                            )}
                                        </>
                                    )}

                                    <div className="flex flex-col gap-2 pt-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                                            Tek Seferlik Ödeme — Ömür Boyu Erişim
                                        </p>
                                        {(verifying || pollTimeout) && (
                                            <div className="space-y-2">
                                                {pollTimeout && (
                                                    <p className="text-xs text-red-600 font-bold">
                                                        Ödeme onayı gecikti. Satın aldıysanız lütfen sayfayı yenileyin.
                                                    </p>
                                                )}
                                                <a href="mailto:support@magicdigital.org" className="text-[10px] text-[#1f3a8a] underline font-bold uppercase tracking-widest">
                                                    Sorun mu var? Destek Alın
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-24 ${!isPremium ? 'blur-[10px] select-none pointer-events-none' : ''}`}>
                        {/* Section 03 & 04 from original structure */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-gray-200">03</span>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-red-900/60 transition-colors">Yanlış Yapılan Noktalar</h2>
                            </div>
                            <div className="p-10 bg-red-50/50 border-l-4 border-red-900/10 space-y-6 text-lg text-gray-800 leading-relaxed font-serif">
                                <p>
                                    Analiz edilen en büyük stratejik hata: Mevcut probleminizi ({survey?.rawAnswers?.difficulty}) yönetirken reaktif bir tutum sergilemenizdir. Planlı olmayan her talep, masada "zayıf el" (weak hand) pozisyonunuzu pekiştirir.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-gray-200">04</span>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-[#1f3a8a]">90 Günlük Aksiyon Planı</h2>
                            </div>
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h4 className="font-black text-xs uppercase text-gray-400 tracking-[0.3em]">İlk 30 Gün: Konumlandırma</h4>
                                    <p className="text-lg bg-gray-50 p-8 border-l-4 border-gray-900 leading-relaxed shadow-sm">
                                        Yöneticinizle yapacağınız ilk görüşmede maaş değil, "yetkinlik kanıtı" dilini kullanın. Finansal beklenti yerine katılan değerin dökümü üzerinden konuşmak, psikolojik baskıyı yönetimin üzerine yıkar.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Professional Footer */}
                <footer className="pt-24 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em]">Kariyer Rota © 2024</p>
                    <div className="flex gap-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        <span>Gizlilik Politikası</span>
                        <span>Kullanım Koşulları</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
