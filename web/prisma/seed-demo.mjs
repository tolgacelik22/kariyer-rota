// Local demo data: `node prisma/seed-demo.mjs` → demo@promotly.local (Pro, 14 weeks of entries)
// and free@promotly.local (Free, 7 weeks — shows the week-6 Pro offer).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WEEK = 7 * 24 * 60 * 60 * 1000;

function weekStartOf(date = new Date()) {
    const d = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    const diff = (d.getUTCDay() + 6) % 7;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
}

const WEEKS = [
    { wins: 'Ödeme servisi için yeniden deneme (retry) mekanizmasını tasarladım ve canlıya aldım.\nYeni gelen 2 mühendisin onboarding planını hazırladım.', impact: 'Başarısız ödeme oranı %4,1 → %1,3. Destek talepleri haftalık 40 → 12.', tags: ['ödeme', 'backend'], links: ['https://jira.example.com/browse/PAY-482', 'https://github.com/example/payments/pull/913'], mood: 5 },
    { wins: 'Sipariş API’sinde N+1 sorgu problemini çözdüm.\nSprint planlamasını ben yönettim (scrum master izindeydi).', impact: 'Sipariş listesi p95 yanıt süresi 1,8 sn → 420 ms.', tags: ['performans', 'liderlik'], links: ['https://github.com/example/orders/pull/1201'], mood: 4 },
    { wins: 'Mobil ekiple birlikte yeni checkout akışının API sözleşmesini netleştirdim.\nİki junior’a code review mentorluğu verdim.', impact: 'Checkout entegrasyonu planlanandan 1 hafta önce bitti.', challenges: 'Ürün gereksinimleri sprint ortasında değişti; kapsamı yeniden pazarlık ettik.', tags: ['iş birliği', 'mentorluk'], mood: 4 },
    { wins: 'Gece yarısı yaşanan ödeme kesintisinde olay yöneticisi (incident commander) oldum, postmortem yazdım.', impact: 'Kesinti 22 dakikada kapatıldı; postmortem’den çıkan 3 aksiyonun 2’si aynı hafta tamamlandı.', learnings: 'Runbook olmadan olay yönetimi çok yavaş; runbook şablonu hazırladım.', tags: ['güvenilirlik', 'liderlik'], links: ['https://confluence.example.com/postmortem-0912'], mood: 2 },
    { wins: 'Runbook şablonunu ekipte yaygınlaştırdım; 6 kritik servis için runbook yazıldı.\nAlarm eşiklerini gözden geçirdim.', impact: 'Gereksiz gece alarmları haftalık 15 → 4.', tags: ['güvenilirlik', 'süreç'], mood: 4 },
    { wins: 'Fatura servisini eski monolitten ayırma (strangler) projesinin teknik tasarımını yazdım ve mimari kurulda sundum.', impact: 'Tasarım onaylandı; Q4 yol haritasına 2 kişilik iş olarak girdi.', tags: ['mimari', 'fatura'], links: ['https://docs.example.com/rfc-billing-split'], mood: 5 },
    { wins: 'Fatura servisinin ilk iki endpoint’ini yeni servise taşıdım, gölge trafik (shadow traffic) ile doğruladım.', impact: '%100 yanıt eşleşmesi; canlıya geçiş riski düşürüldü.', challenges: 'Eski veritabanı şemasında belgelenmemiş alanlar çıktı.', tags: ['fatura', 'backend'], mood: 3 },
    { wins: 'Ekip içi “haftalık teknik paylaşım” oturumunu başlattım; ilk oturumda gözlemlenebilirlik anlattım.', impact: '9 kişi katıldı; 2 ekip tracing’e geçmeye karar verdi.', tags: ['bilgi paylaşımı', 'liderlik'], mood: 5 },
    { wins: 'Kampanya döneminde yük testi planladım ve çalıştırdım; darboğaz olan cache katmanını ölçeklendirdim.', impact: 'Kampanya günü 3,2 kat trafik sıfır kesintiyle karşılandı.', tags: ['performans', 'güvenilirlik'], links: ['https://grafana.example.com/d/campaign'], mood: 5 },
    { wins: 'Fatura servisinde kalan endpoint’leri taşıdım; eski kod yolunu kapattım.', impact: 'Monolitten ~4.000 satır kod kaldırıldı; fatura deploy süresi 40 dk → 6 dk.', tags: ['fatura', 'mimari'], mood: 4 },
    { wins: 'Yeni gelen junior’ın ilk özelliğini canlıya almasına eşlik ettim.\nQ4 OKR taslağına katkı verdim.', impact: 'Junior 3. haftasında ilk PR’ını canlıya aldı (ekip ortalaması 6 hafta).', tags: ['mentorluk'], mood: 4 },
    { wins: 'Ödeme sağlayıcısı değişikliği için risk analizi ve geçiş planı hazırladım.', impact: 'Komisyon maliyetinde yıllık tahmini %18 tasarruf fırsatı belirlendi.', nextWeek: 'Plana ürün ve finans ekiplerinden onay almak.', tags: ['ödeme', 'strateji'], mood: 4 },
    { wins: 'Geçiş planını ürün ve finans ekiplerine sundum, onay aldım.\nPCI uyumluluk kontrol listesini güncelledim.', impact: 'Proje Q1 bütçesine alındı.', tags: ['ödeme', 'iş birliği'], mood: 5 },
    { wins: 'Yeni ödeme sağlayıcısı için sandbox entegrasyonunu tamamladım; feature flag ile %5 trafikte test başladı.', impact: 'Test trafiğinde başarı oranı %98,9 (eski sağlayıcı %97,6).', nextWeek: 'Trafiği %25’e çıkarmak, maliyet raporunu finansla paylaşmak.', tags: ['ödeme', 'backend'], links: ['https://github.com/example/payments/pull/1377'], mood: 5 },
];

async function seedUser(email, data, weeks) {
    const user = await prisma.user.upsert({ where: { email }, update: data, create: { email, ...data } });
    await prisma.weeklyEntry.deleteMany({ where: { userId: user.id } });
    await prisma.report.deleteMany({ where: { userId: user.id } });
    const thisWeek = weekStartOf();
    for (let i = 0; i < weeks.length; i++) {
        const weekStart = new Date(thisWeek.getTime() - (weeks.length - 1 - i) * WEEK);
        await prisma.weeklyEntry.create({ data: { userId: user.id, weekStart, tags: [], links: [], ...weeks[i] } });
    }
    return user;
}

const pro = await seedUser(
    'demo@promotly.local',
    { name: 'Deniz', jobTitle: 'Kıdemli Yazılım Mühendisi', proUntil: new Date(Date.now() + 365 * 86400000), proPlan: 'yearly', priceVariant: '199' },
    WEEKS,
);
// Free user: no entry this week, so the form is empty and the streak continues from last week.
const free = await seedUser('free@promotly.local', { name: 'Ece', jobTitle: 'Ürün Yöneticisi', proUntil: null, proPlan: null, priceVariant: '199' }, WEEKS.slice(0, 7));
await prisma.weeklyEntry.deleteMany({ where: { userId: free.id, weekStart: weekStartOf() } });
await prisma.weeklyEntry.create({
    data: { userId: free.id, weekStart: new Date(weekStartOf().getTime() - 7 * WEEK), wins: 'Kullanıcı görüşmelerinden 12 içgörü çıkardım.', tags: ['araştırma'], links: [] },
});

console.log('Seeded:', pro.email, '(Pro, 14 hafta) and', free.email, '(Free, 7 hafta)');
await prisma.$disconnect();
