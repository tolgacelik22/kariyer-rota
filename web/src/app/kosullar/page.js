export const metadata = {
    title: 'Kullanım Koşulları — Promotly',
    description: 'Promotly kullanım koşulları ve abonelik şartları',
};

const SECTIONS = [
    ['Hizmet', 'Promotly, kullanıcının kendi yazdığı haftalık iş kayıtlarını saklayan ve bu kayıtlardan özet ve raporlar üreten bir kişisel performans arşividir. Raporlar kullanıcının girdiği bilgilere dayanır; doğruluğundan ve kullanımından kullanıcı sorumludur.'],
    ['Hesap', 'Hesap, e-posta adresine gönderilen tek kullanımlık kod veya bağlantıyla açılır. Hesabın güvenliğinden ve e-posta erişiminden kullanıcı sorumludur.'],
    ['İçerik ve gizlilik', 'Kayıtlarına işverenine ait gizli bilgileri (müşteri adları, kaynak kod, iç finansal veriler, kişisel veriler) yazmamalısın. Promotly şirket sistemlerine bağlanmaz. Verilerin işlenmesi KVKK Aydınlatma Metni’nde açıklanmıştır.'],
    ['Pro abonelik', 'Pro aylık veya yıllık abonelik olarak sunulur. Mobil uygulamada satın alınan abonelikler App Store veya Google Play üzerinden faturalandırılır ve dönem sonundan en az 24 saat önce iptal edilmezse aynı süre ve ücretle otomatik yenilenir. Aboneliği mağaza hesap ayarlarından yönetebilir ve iptal edebilirsin; iptal, mevcut dönemin sonunda geçerli olur. İade talepleri ilgili mağazanın politikalarına tabidir. Web üzerinden yapılan ödemeler otomatik yenilenmez.'],
    ['Ücretsiz plan', 'Ücretsiz planda haftalık kayıt, son 8 haftanın görüntülenmesi ve temel aylık özet sunulur. Dışa aktarma ve hesap silme her planda ücretsizdir. Pro sona erdiğinde kayıtların silinmez.'],
    ['Hesabın silinmesi', 'Hesabını uygulamadaki Profil > Hesabı sil adımıyla dilediğin an kalıcı olarak silebilirsin. Silme, aktif bir mağaza aboneliğini otomatik olarak iptal etmez; aboneliği mağazadan ayrıca iptal etmelisin.'],
    ['Sorumluluk', 'Promotly, terfi, ücret artışı veya işe alım gibi bir sonucu garanti etmez. Hizmet “olduğu gibi” sunulur; kesintisiz veya hatasız çalışacağı taahhüt edilmez.'],
    ['İletişim', 'Sorular ve talepler için: destek@magicdigital.org'],
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-12">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
                <h1 className="border-b pb-4 text-2xl font-black text-slate-900">Kullanım Koşulları</h1>
                <div className="mt-6 space-y-6">
                    {SECTIONS.map(([title, text]) => (
                        <section key={title}>
                            <h2 className="font-bold text-slate-900">{title}</h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                        </section>
                    ))}
                </div>
                <p className="mt-10 border-t pt-6 text-xs font-bold uppercase tracking-widest text-slate-400">Promotly · Son güncelleme: Ekim 2026</p>
            </div>
        </div>
    );
}
