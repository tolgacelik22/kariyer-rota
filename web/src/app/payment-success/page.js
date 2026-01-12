'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const [status, setStatus] = useState('processing');
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const router = useRouter();

    useEffect(() => {
        if (orderId) {
            verifyPayment(orderId);
        }
    }, [orderId]);

    const verifyPayment = async (oid) => {
        try {
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: oid }),
            });

            if (res.ok) {
                setStatus('success');
                // Refresh page after a delay or redirect
                setTimeout(() => {
                    router.push('/report');
                }, 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6">
            {status === 'processing' && (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a8a]"></div>
                    <h2 className="text-2xl font-bold">Ödeme Doğrulanıyor...</h2>
                    <p className="text-gray-500">Lütfen bu sayfadan ayrılmayın.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Ödeme Başarılı!</h2>
                    <p className="text-gray-600">Raporunuzun tüm bölümleri açıldı. 3 saniye içinde yönlendiriliyorsunuz...</p>
                    <Link href="/report" className="text-[#1f3a8a] font-bold underline">Gitmiyorsa buraya tıklayın</Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Doğrulama Hatası</h2>
                    <p className="text-gray-600">Ödemeniz doğrulanırken bir hata oluştu. Lütfen bizimle iletişime geçin.</p>
                    <Link href="/report" className="bg-[#1f3a8a] text-white px-6 py-2 rounded-md transition-colors">Rapora Geri Dön</Link>
                </>
            )}
        </div>
    );
}
