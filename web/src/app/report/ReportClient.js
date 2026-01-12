'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportClient({ user, survey, isPremium: initialPremium }) {
    const [isPremium, setIsPremium] = useState(initialPremium);
    const [verifying, setVerifying] = useState(false);
    const [pollTimeout, setPollTimeout] = useState(false);

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
                properties: { price: 499 }
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
                        <div className="p-8 bg-gray-50 rounded-lg space-y-4">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Piyasa Konumlanması</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Kıdem seviyeniz ({survey?.rawAnswers?.seniority}) ve tecrübe süreniz ({survey?.rawAnswers?.experience}) dikkate alındığında, benzer rollerdeki lider %20'lik dilimle aranızda belirgin bir "risk toleransı" farkı bulunmaktadır.
                            </p>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-lg space-y-4">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Psikolojik Eşik</h3>
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
                            <div className="sticky top-40 w-full max-w-lg bg-white p-10 border-4 border-[#1f3a8a] shadow-[0_20px_50px_rgba(31,58,138,0.3)] space-y-8 text-center rounded-xl animate-in zoom-in duration-300">
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900">Raporun Tamamını Açın</h3>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Kariyerinizdeki engelleri kaldırmak için gereken 3 kritik bölüm henüz kilitli.
                                    </p>
                                </div>

                                <div className="space-y-4 text-left border-y border-gray-100 py-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                        <span className="text-[#1f3a8a] font-black">✓</span>
                                        <span><strong>90 günlük aksiyon planı:</strong> Ay ay ne yapmalısınız?</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                        <span className="text-[#1f3a8a] font-black">✓</span>
                                        <span><strong>Müzakere Stratejisi:</strong> Kullanmanız gereken tam cümle örnekleri.</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                        <span className="text-[#1f3a8a] font-black">✓</span>
                                        <span><strong>Hata Analizi:</strong> Mevcut yaklaşımınızda kaçınmanız gerekenler.</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                        <span className="text-[#1f3a8a] font-black">✓</span>
                                        <span><strong>Hazırlık Checklist:</strong> Görüşme öncesi kontrol listesi.</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {verifying ? (
                                        <div className="p-4 bg-blue-50 text-[#1f3a8a] rounded-md animate-pulse font-bold">
                                            Ödemeniz doğrulanıyor, lütfen bekleyin...
                                        </div>
                                    ) : (
                                        <Link
                                            onClick={handlePayClick}
                                            href={`/api/payment/shopier?userId=${user?.id}`}
                                            className="block w-full bg-[#1f3a8a] text-white py-5 rounded-md font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl active:scale-95 text-lg"
                                        >
                                            Tüm Analizi Aç (₺499)
                                        </Link>
                                    )}

                                    <div className="flex flex-col gap-2">
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

                    <div className={`space-y-20 ${!isPremium ? 'blur-[10px] select-none pointer-events-none' : ''}`}>
                        {/* Section 3: Detailed Risks */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-gray-200">03</span>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-red-800">Yanlış Yapılan Noktalar</h2>
                            </div>
                            <div className="space-y-6 text-gray-700 leading-relaxed font-serif text-lg">
                                <p>
                                    Analiz edilen en büyük hata: Mevcut probleminizi ({survey?.rawAnswers?.difficulty}) çözerken reaktif (tepki veren) bir tutum sergilemenizdir. Proaktif bir plan olmaksızın atılan her adım, üzerinizdeki "vazgeçilebilir personel" algısını güçlendiriyor.
                                </p>
                            </div>
                        </section>

                        {/* Section 4: Action Plan */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-gray-200">04</span>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-[#1f3a8a]">Önerilen Aksiyon Planı</h2>
                            </div>
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h4 className="font-black text-sm uppercase text-gray-400 tracking-widest">İlk 30 Gün: Konumlandırma</h4>
                                    <p className="text-lg bg-gray-50 p-6 border-l-4 border-gray-900 leading-relaxed">
                                        Yöneticinizle yapacağınız bir sonraki görüşmede maaş konusunu değil, "verdiğiniz katma değerin ölçümlenmesini" açın. Bu, karşı tarafa güven veren profesyonel bir tuzaktır.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black text-sm uppercase text-gray-400 tracking-widest">Sonraki 60 Gün: Müzakere</h4>
                                    <p className="text-lg bg-gray-50 p-6 border-l-4 border-gray-900 leading-relaxed">
                                        Belirlediğiniz KPI değerlerini 2 ay boyunca dökümante edin. 60. günün sonunda bu verilerle masaya oturarak "benim değerim bu, piyasa karşılığı bu" diyebilecek somut kanıta sahip olacaksınız.
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
