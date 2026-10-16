import { CalendarCheck, CalendarDays, BarChart3, Award, Briefcase, ShieldCheck, Download, Trash2, Link2, Clock } from 'lucide-react';
import Logo from '@/components/Logo';
import Pricing from '@/components/Pricing';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const RHYTHM = [
    { icon: CalendarCheck, when: 'Her cuma', title: '5 dakikalık haftalık kayıt', text: 'Ne yaptın, etkisi ne oldu, kanıtı nerede? Üç kutu, beş dakika.' },
    { icon: CalendarDays, when: 'Her ay', title: 'Somut çıktılar özeti', text: 'Tamamlanan işler ve ölçülebilir katkılar tek sayfada.' },
    { icon: BarChart3, when: 'Her çeyrek', title: 'Hedef ve gelişim analizi', text: 'Tekrarlayan güçlü yönlerin, gelişim alanların, sonraki çeyrek hedeflerin.' },
    { icon: Award, when: '6 ayda bir', title: 'Performans & terfi dosyası', text: 'Yöneticine götüreceğin, kanıtlarla desteklenmiş rapor ve görüşme hazırlığı.' },
    { icon: Briefcase, when: 'İş değiştirirken', title: 'Başarı hikâyeleri', text: 'CV maddeleri ve mülakat için STAR formatında hazır hikâyeler.' },
];

const FAQ = [
    {
        q: 'Şirketimin gizli bilgilerini mi yükleyeceğim?',
        a: 'Hayır. Jira, GitHub ya da şirket sistemlerine bağlanmıyoruz. Sadece senin yazdığın özet ve isteğe bağlı kanıt bağlantıları saklanır. Müşteri adı, kod veya gizli rakam yazmamanı öneriyoruz; “%30 hızlandı” yeterli.',
    },
    {
        q: 'Değerlendirme yılda bir kez, neden her ay ödeyeyim?',
        a: 'Değer her hafta birikiyor: haftalık AI özetini yöneticine iletebilir, aylık ve çeyrek analizleriyle gidişatını görebilirsin. İstersen yıllık planla iki değerlendirme dönemini tek ödemeyle kapsarsın.',
    },
    {
        q: 'Verilerim bana ait mi?',
        a: 'Evet. Tüm arşivini istediğin an JSON veya Markdown olarak indirebilir, hesabını tek tıkla tamamen silebilirsin. Bu özellikler ücretsiz planda da açık.',
    },
    {
        q: 'Bir hafta kaçırırsam?',
        a: 'Sorun değil. Ücretsiz planda geçen haftayı, Pro’da 8 hafta geriye kadar kayıt ekleyebilirsin. Cuma günleri e-postayla hatırlatırız.',
    },
];

export default async function Landing() {
    const user = await getCurrentUser();
    const ctaHref = user ? '/app' : '/giris';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Logo subtitle />
                    <nav className="flex items-center gap-2 text-sm font-semibold">
                        <a href="#fiyat" className="hidden px-3 py-2 text-slate-600 hover:text-slate-900 sm:block">Fiyatlar</a>
                        <a href={ctaHref} className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">
                            {user ? 'Arşivime git' : 'Giriş yap'}
                        </a>
                    </nav>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            <Clock className="h-3.5 w-3.5" /> Haftada 5 dakika
                        </p>
                        <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight md:text-5xl">
                            Terfi görüşmesinde ne yaptığını <span className="text-brand">hatırlamaya çalışma.</span>
                        </h1>
                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Her cuma 5 dakika ayır, yaptıklarını kaydet. Altı ay sonra Promotly, kanıtlarla desteklenmiş performans ve terfi
                            dosyanı senin için hazırlasın.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href={ctaHref} className="rounded-xl bg-brand px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-brand-dark">
                                Ücretsiz başla
                            </a>
                            <a href="#nasil" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 hover:bg-slate-100">
                                Nasıl çalışır?
                            </a>
                        </div>
                        <p className="mt-4 text-xs text-slate-500">Kredi kartı gerekmez · Şirket sistemlerine bağlanmaz · Verin her an indirilebilir</p>
                    </div>

                    <div className="relative">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cuma kaydı · 10 – 14 Eki</p>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">🔥 7 hafta seri</span>
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <Field label="Yapılanlar" text="Ödeme servisi için yeniden deneme mekanizmasını canlıya aldım; yeni gelen 2 kişinin onboarding’ini yürüttüm." />
                                <Field label="Etki" text="Başarısız ödeme oranı %4,1 → %1,3. Destek talepleri haftalık 40 → 12." />
                                <p className="flex items-center gap-1.5 text-xs text-brand">
                                    <Link2 className="h-3.5 w-3.5" /> jira/PAY-482 · github/pull/913
                                </p>
                            </div>
                            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-slate-700">
                                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand">AI haftalık özet</p>
                                <ul className="list-disc space-y-1 pl-4">
                                    <li>Ödeme hatalarını %68 azaltan yeniden deneme mekanizmasını yayına aldı.</li>
                                    <li>Destek yükünü haftalık 28 talep düşürdü.</li>
                                    <li>İki yeni ekip üyesinin uyum sürecini yönetti.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="nasil" className="border-y border-slate-200 bg-white py-20">
                    <div className="mx-auto max-w-6xl px-4">
                        <h2 className="text-3xl font-black tracking-tight">Sadece dönem sonunda değil, her hafta değer üretir</h2>
                        <p className="mt-3 max-w-2xl text-slate-600">
                            Promotly bir “dönem sonu rapor aracı” değil; yıl boyunca biriken kişisel performans arşivin.
                        </p>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {RHYTHM.map(({ icon: Icon, when, title, text }) => (
                                <div key={when} className="rounded-2xl border border-slate-200 p-5">
                                    <Icon className="h-6 w-6 text-brand" />
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-600">{when}</p>
                                    <p className="mt-1 font-bold">{title}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-20">
                    <div className="grid gap-10 md:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Kimin için?</h2>
                            <p className="mt-4 leading-relaxed text-slate-600">
                                Dönem sonunda yaptığı işi yöneticisine kanıtlamak zorunda olan herkes için: yazılım, ürün, veri, finans, danışmanlık,
                                pazarlama ve kurumsal ekiplerde çalışan profesyoneller. Jira biletleri, PR’lar, toplantı notları ve proje çıktılarıyla
                                çalışıyorsan, kanıtın zaten var — sadece bir yerde toplanmıyor.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-slate-900 p-8 text-white">
                            <ShieldCheck className="h-7 w-7 text-amber-300" />
                            <h3 className="mt-4 text-xl font-bold">Veri senin kontrolünde</h3>
                            <ul className="mt-4 space-y-3 text-sm text-slate-300">
                                <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-300" /> Şirket sistemlerine bağlanmaz, kod veya belge çekmez.</li>
                                <li className="flex gap-2"><Download className="h-4 w-4 shrink-0 text-amber-300" /> Tüm arşivini JSON / Markdown olarak indir.</li>
                                <li className="flex gap-2"><Trash2 className="h-4 w-4 shrink-0 text-amber-300" /> Hesabını ve tüm kayıtlarını tek tıkla sil.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="fiyat" className="border-t border-slate-200 bg-white py-20">
                    <div className="mx-auto max-w-6xl px-4">
                        <h2 className="text-3xl font-black tracking-tight">Basit fiyatlandırma</h2>
                        <p className="mt-3 text-slate-600">Ücretsiz başla, alışkanlık oturunca Pro’ya geç.</p>
                        <div className="mt-10">
                            <Pricing ctaHref={ctaHref} />
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-20">
                    <h2 className="text-3xl font-black tracking-tight">Sık sorulanlar</h2>
                    <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                        {FAQ.map(({ q, a }) => (
                            <details key={q} className="group p-5">
                                <summary className="cursor-pointer list-none font-bold">{q}</summary>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500">
                    <Logo />
                    <div className="flex gap-5">
                        <a href="/analiz" className="hover:text-slate-900">Ücretsiz kariyer analizi</a>
                        <a href="/kvkk" className="hover:text-slate-900">KVKK</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Field({ label, text }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <p className="text-slate-800">{text}</p>
        </div>
    );
}
