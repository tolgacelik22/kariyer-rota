import crypto from 'crypto';

export const KVKK_VERSION = 'v1';

export const KVKK_TEXT = `
KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ VE AÇIK RIZA FORMU

1. Veri Sorumlusu
Kariyer Rota (Aşağıda "Platform" olarak anılacaktır), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca kişisel verilerinizi aşağıda açıklanan kapsamda işlemektedir.

2. İşlenen Kişisel Veriler
Platform üzerinden gerçekleştirilen anket/quiz çalışması kapsamında; sağladığınız yanıtlar, anket puanınız, (varsa) e-posta adresiniz, IP adresiniz ve kullanıcı aracısı (user agent) bilgileriniz işlenmektedir.

3. İşlenme Amacı
Size özel kariyer analiz raporunun oluşturulması ve sunulması amacıyla verileriniz işlenir.

4. Haklarınız
Kanun kapsamında verilerinizin işlenip işlenmediğini öğrenme ve düzeltilmesini isteme hakkına sahipsiniz.

AÇIK RIZA BEYANI
Yukarıdaki Aydınlatma Metni'ni okuduğumu, anladığımı ve kişisel verilerimin bu metinde belirtilen amaçlarla işlenmesine özgür irademle açık rıza verdiğimi kabul ve beyan ederim.
`;

export function getKvkkHash() {
    return crypto.createHash('sha256').update(KVKK_TEXT).digest('hex');
}
