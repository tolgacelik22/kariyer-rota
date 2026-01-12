'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function PremiumSuccessContent() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('orderid') || '');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');

    useEffect(() => {
        if (orderId) {
            handleVerify(orderId);
        }
    }, []);

    const handleVerify = async (idToVerify) => {
        const id = idToVerify || orderId;
        if (!id) return;

        setStatus('loading');
        setError('');

        try {
            const res = await fetch('/api/shopier/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderid: id }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('success');
                setOrderId(id); // Ensure state matches verified ID
            } else {
                setStatus('error');
                setError(data.error || 'Sipariş doğrulanamadı.');
            }
        } catch (err) {
            setStatus('error');
            setError('Bağlantı hatası oluştu.');
        }
    };

    return (
        <div className="min-h-screen bg-white py-20 px-6 flex flex-col items-center">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">ÖDEME BAŞARILI</h1>
                    <p className="text-gray-500 font-medium">Analiz raporunuz hazırlanıyor.</p>
                </div>

                {status === 'idle' && !orderId && (
                    <div className="space-y-4 pt-4">
                        <p className="text-sm text-gray-600">Sipariş numaranız otomatik gelmediyse lütfen aşağıya girin:</p>
                        <input
                            type="text"
                            placeholder="Sipariş Numarası (Örn: 123456)"
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#1f3a8a] outline-none transition-all"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                        />
                        <button
                            onClick={() => handleVerify()}
                            className="w-full bg-[#1f3a8a] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-900 transition-all"
                        >
                            Raporu Getir
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="py-10 flex flex-col items-center space-y-4">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#1f3a8a] rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Doğrulanıyor...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 pt-4 animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <p className="text-green-700 text-sm font-medium">
                                Ödemeniz doğrulandı. Detaylı stratejik raporunuz hazır!
                            </p>
                        </div>
                        <a
                            href={`/api/report/premium-pdf?orderid=${orderId}`}
                            className="w-full bg-[#1f3a8a] text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-900 transition-all shadow-xl block text-center"
                        >
                            Detaylı Raporu PDF İndir
                        </a>
                        <p className="text-[10px] text-gray-400">
                            Dosya otomatik inmezse butona tekrar basın.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 pt-4">
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-left">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                            <p className="text-red-600 text-[10px] mt-2 leading-relaxed">
                                Not: Shopier ödeme onayı 1-2 dakika gecikebilir. Lütfen kısa bir süre sonra tekrar deneyin veya e-postanızı kontrol edin.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleVerify()}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all"
                            >
                                Tekrar Dene
                            </button>
                            <input
                                type="text"
                                placeholder="Farklı Sipariş No Gir"
                                className="w-full text-center text-xs text-gray-400 bg-transparent py-2 border-b border-gray-100 focus:border-[#1f3a8a] outline-none"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <footer className="pt-20">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        Kariyer Rota — Support: magicdigital.org
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default function PremiumSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Yükleniyor...</div>}>
            <PremiumSuccessContent />
        </Suspense>
    );
}
