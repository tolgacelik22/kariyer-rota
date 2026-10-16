import { TrendingUp } from 'lucide-react';

export default function Logo({ subtitle = false, href = '/' }) {
    return (
        <a href={href} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <TrendingUp className="h-4 w-4" strokeWidth={3} />
            </span>
            <span className="leading-tight">
                <span className="block text-lg font-black tracking-tight text-slate-900">Promotly</span>
                {subtitle && <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Terfi ve Başarı Arşivi</span>}
            </span>
        </a>
    );
}
