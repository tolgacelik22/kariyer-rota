'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { priceVariants, pricesFor } from '@/lib/plans';

function readVariantCookie() {
    const m = document.cookie.match(/(?:^|; )pv=([^;]+)/);
    return m ? m[1] : null;
}

// Price A/B test: a visitor keeps one variant (cookie `pv`), which is stored on their account at signup.
export function usePriceVariant() {
    const [prices, setPrices] = useState(pricesFor(null));
    useEffect(() => {
        const variants = priceVariants();
        let v = readVariantCookie();
        if (!variants.includes(v)) {
            v = variants[Math.floor(Math.random() * variants.length)];
            document.cookie = `pv=${v}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        }
        setPrices(pricesFor(v));
    }, []);
    return prices;
}

const FREE = ['Her hafta 1 kayıt (cuma 5 dakika)', 'Son 8 haftanın geçmişi', 'Temel aylık özet', 'Dışa aktarma ve silme her zaman ücretsiz'];
const PRO = [
    'Sınırsız geçmiş ve 8 haftaya kadar geriye kayıt',
    'Her kayda AI haftalık özet',
    'AI aylık özet ve çeyrek gelişim analizi',
    '6 aylık performans & terfi dosyası',
    'CV ve mülakat için STAR başarı hikâyeleri',
];

export function fmtTL(n) {
    return `${n.toLocaleString('tr-TR')} TL`;
}

export default function Pricing({ ctaHref = '/giris' }) {
    const prices = usePriceVariant();
    const discount = Math.round((1 - prices.yearly / (prices.monthly * 12)) * 100);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <PlanCard title="Ücretsiz" price="0 TL" note="Alışkanlık kazan" items={FREE} cta="Ücretsiz başla" href={ctaHref} />
            <PlanCard
                title="Pro — aylık"
                price={`${fmtTL(prices.monthly)}`}
                suffix="/ay"
                note="İstediğin zaman bırak"
                items={PRO}
                cta="Pro ile başla"
                href={`${ctaHref}?plan=monthly`}
                highlight
            />
            <PlanCard
                title="Pro — yıllık"
                price={`${fmtTL(prices.yearly)}`}
                suffix="/yıl"
                note={`Aylığa göre ~%${discount} indirim`}
                items={['Pro’daki her şey', 'İki değerlendirme dönemini kapsar', 'Tek ödeme, yıl boyu arşiv']}
                cta="Yıllık al"
                href={`${ctaHref}?plan=yearly`}
            />
        </div>
    );
}

function PlanCard({ title, price, suffix, note, items, cta, href, highlight }) {
    return (
        <div
            className={`flex flex-col rounded-2xl border p-7 ${highlight ? 'border-brand bg-brand text-white shadow-xl shadow-blue-900/20' : 'border-slate-200 bg-white'}`}
        >
            <p className={`text-xs font-bold uppercase tracking-widest ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>{title}</p>
            <p className="mt-3 text-4xl font-black tracking-tight">
                {price}
                {suffix && <span className={`text-base font-semibold ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{suffix}</span>}
            </p>
            <p className={`mt-1 text-sm ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>{note}</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
                {items.map((i) => (
                    <li key={i} className="flex gap-2">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-amber-300' : 'text-brand'}`} />
                        <span>{i}</span>
                    </li>
                ))}
            </ul>
            <a
                href={href}
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-bold transition ${highlight ? 'bg-white text-brand hover:bg-blue-50' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
                {cta}
            </a>
        </div>
    );
}
