import crypto from 'crypto';

export const KVKK_VERSION = 'v2';

export const KVKK_TEXT = `
KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ VE AÇIK RIZA FORMU

1. Veri Sorumlusu
Promotly / Kariyer Rota (Aşağıda "Platform" olarak anılacaktır), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca kişisel verilerinizi aşağıda açıklanan kapsamda işlemektedir.

2. İşlenen Kişisel Veriler
E-posta adresiniz, (girdiyseniz) adınız ve pozisyonunuz; haftalık kayıtlarınızda yazdığınız iş çıktıları, etkiler, notlar, etiketler ve kanıt bağlantıları; oluşturulan raporlar; anket/quiz yanıtlarınız ve puanınız; ödeme kayıtlarınız (sipariş numarası, tutar); IP adresiniz ve kullanıcı aracısı (user agent) bilgileriniz.

3. İşlenme Amacı
Haftalık performans arşivinizin tutulması; haftalık, aylık, çeyreklik ve altı aylık raporlarınızın hazırlanması; hatırlatma ve hesap e-postalarının gönderilmesi; ödeme ve üyelik işlemlerinin yürütülmesi; hizmetin güvenliği ve iyileştirilmesi.

4. Yurt Dışına Aktarım
Pro planındaki yapay zekâ özet ve raporları, kayıtlarınızın metninin yurt dışında bulunan yapay zekâ hizmet sağlayıcısına (OpenAI) iletilmesiyle üretilir. Bu aktarım yalnızca rapor üretimi amacıyla ve açık rızanıza dayanarak yapılır. Şirketinize ait gizli bilgileri (müşteri adları, kaynak kod, iç finansal veriler) kayıtlarınıza yazmamanızı öneririz.

5. Saklama ve Silme
Verileriniz hesabınız açık olduğu sürece saklanır. Hesap sayfasından tüm verilerinizi istediğiniz an indirebilir veya hesabınızı ve tüm kayıtlarınızı kalıcı olarak silebilirsiniz. Yasal saklama yükümlülüğü bulunan ödeme kayıtları, kimliğinizle ilişkisi kesilerek muhafaza edilir.

6. Haklarınız
Kanun'un 11. maddesi kapsamında verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.

AÇIK RIZA BEYANI
Yukarıdaki Aydınlatma Metni'ni okuduğumu, anladığımı; kişisel verilerimin bu metinde belirtilen amaçlarla işlenmesine ve yapay zekâ raporları için yurt dışına aktarılmasına özgür irademle açık rıza verdiğimi kabul ve beyan ederim.
`;

export function getKvkkHash() {
    return crypto.createHash('sha256').update(KVKK_TEXT).digest('hex');
}
