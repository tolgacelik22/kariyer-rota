import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isPro } from '@/lib/plans';
import Logo from '@/components/Logo';
import AppNav from '@/components/AppNav';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
    const user = await getCurrentUser();
    if (!user) redirect('/giris');

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="no-print border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <Logo href="/app" />
                    <AppNav pro={isPro(user)} />
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
    );
}
