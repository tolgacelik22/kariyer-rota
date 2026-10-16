'use client';

import { usePathname } from 'next/navigation';

const LINKS = [
    { href: '/app', label: 'Bu hafta' },
    { href: '/app/raporlar', label: 'Raporlar' },
    { href: '/app/hesap', label: 'Hesap' },
];

export default function AppNav({ pro }) {
    const path = usePathname();
    return (
        <nav className="flex items-center gap-1 text-sm font-semibold">
            {LINKS.map((l) => {
                const active = l.href === '/app' ? path === '/app' : path.startsWith(l.href);
                return (
                    <a
                        key={l.href}
                        href={l.href}
                        className={`rounded-lg px-3 py-2 ${active ? 'bg-blue-50 text-brand' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        {l.label}
                    </a>
                );
            })}
            <span className={`ml-2 rounded-full px-2.5 py-1 text-xs font-bold ${pro ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                {pro ? 'PRO' : 'Ücretsiz'}
            </span>
        </nav>
    );
}
