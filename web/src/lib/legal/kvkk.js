import crypto from 'crypto';

export const KVKK_VERSION = 'v1.0';

export const KVKK_TEXT = `
KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ VE AÇIK RIZA FORMU

1. Veri Sorumlusu
Kariyer Rota (Aşağıda "Platform" olarak anılacaktır), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca kişisel verilerinizi aşağıda açıklanan kapsamda işlemektedir.

2. İşlenen Kişisel Veriler
Platform üzerinden gerçekleştirilen anket/quiz çalışması kapsamında; sağladığınız yanıtlar, anket puanınız, (varsa) e-posta adresiniz, IP adresiniz ve kullanıcı aracısı (user agent) bilgileriniz işlenmektedir.

3. Kişisel Verilerin İşlenme Amacı
Kişisel verileriniz;
- Size özel kariyer analiz raporunun oluşturulması ve sunulması,
- Hizmetlerimizin iyileştirilmesi ve analiz edilmesi,
- (Onay vermeniz halinde) Bilgilendirme ve pazarlama iletişimlerinin yapılması
amaçlarıyla işlenmektedir.

4. Kişisel Verilerin Aktarılması
Kişisel verileriniz, yasal yükümlülüklerin yerine getirilmesi amacıyla yetkili kamu kurum ve kuruluşları ile paylaşılabilecek olup, bunun dışında üçüncü taraflarla ticari amaçla paylaşılmamaktadır.

5. Toplama Yöntemi ve Hukuki Sebep
Kişisel verileriniz, tamamen otomatik yollarla dijital ortamda toplanmaktadır. İşleme faaliyeti, Kanun'un 5/1 maddesi uyarınca "ilgili kişinin açık rızası" hukuki sebebine dayanmaktadır.

6. İlgili Kişinin Hakları
Kanun'un 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve verilerinizin işlenmesine itiraz etme haklarına sahipsiniz.

AÇIK RIZA BEYANI
Yukarıdaki Aydınlatma Metni'ni okuduğumu, anladığımı ve kişisel verilerimin bu metinde belirtilen amaçlarla işlenmesine özgür irademle açık rıza verdiğimi kabul ve beyan ederim.
`;

export function getKvkkHash() {
    return crypto.createHash('sha256').update(KVKK_TEXT).digest('hex');
}
