# Promotly — mağaza görselleri ve reklam videoları

Her şey bu klasörden yeniden üretilebilir. Ekran görüntüleri gerçek uygulamadan (Android emülatörü, demo verisi) alındı.

## Çıktılar (`out/`)

| Dosya | Ne için | Ölçü |
|---|---|---|
| `play-store/store-1..8.png` | Google Play telefon ekran görüntüleri (sırayla yükle) | 1080×1920 |
| `play-store/feature-graphic.png` | Google Play öne çıkan görsel | 1024×500 |
| `play-store/app-icon-512.png` | Google Play uygulama simgesi | 512×512 |
| `subscription/subscription-1..3.png` | Abonelik/paywall ekranları, çerçeveli (mağaza sayfası, iç sunum) | 1080×1920 |
| `subscription/raw-*.png` | Paywall ham ekran görüntüleri — App Store abonelik "Review Screenshot" vb. inceleme alanları için | 1080×2400 |
| `video/promo-vertical.mp4` | Profesyonel tanıtım — Instagram Reels, TikTok, YouTube Shorts | 1080×1920, ~50 sn |
| `video/promo-horizontal.mp4` | Profesyonel tanıtım — YouTube (yatay) | 1920×1080, ~50 sn |
| `video/story-vertical.mp4` | Kullanıcı hikâyesi (birinci ağızdan, UGC tarzı) — Reels, TikTok, Shorts | 1080×1920, ~47 sn |

Google Play aboneliklerde ayrı bir inceleme ekran görüntüsü istemez; `subscription/` klasörü App Store'a çıkılırsa ve mağaza sayfasında Pro'yu göstermek istersen hazır.

## Videolar hakkında

- Seslendirme: Microsoft Edge nöral sesleri (ücretsiz). Tanıtım: `tr-TR-AhmetNeural`, hikâye: `tr-TR-EmelNeural`. Altyazılar ses ile kelime kelime senkron.
- Müzik: `scripts/music.mjs` ile kod ile üretildi — telif/lisans riski yok.
- Hikâye videosunda yapay ses ile canlandırma yapıldığı için ekranda **"Canlandırmadır"** etiketi var. Gerçek bir kullanıcıya dayanmayan "terfi aldım" gibi sonuç iddiası bilerek yok (yanıltıcı reklam riski).
- 9:16 videolarda altyazılar TikTok/Reels arayüzünün kapladığı alt bölgenin üstünde.

## Gerçek kişi / AI avatar versiyonu

Ücretsiz ve yerel çalışan, yüzü konuşturan bir avatar aracı bu bilgisayarda (AMD GPU, CUDA yok) çalıştırılamıyor; bulut araçları da hesap gerektiriyor. Hesap açarsan şu metni olduğu gibi kullanabilirsin (HeyGen ücretsiz plan, CapCut "AI avatar", D-ID deneme):

> Geçen yıl performans görüşmemde resmen boş kaldım. Yöneticim son altı ayda neler yaptığımı sordu, ben iki hafta öncesini bile zor hatırladım. Sonra Promotly'yi denemeye başladım. Her cuma, bilgisayarı kapatmadan önce beş dakika ayırıyorum. O hafta ne yaptım, etkisi ne oldu, yazıyorum. Uygulama bunu yöneticime direkt gönderebileceğim üç maddeye çeviriyor. Bu dönem görüşmeye altı aylık terfi dosyamla girdim; her katkının yanında kanıtı vardı. İlk defa ne söyleyeceğimi düşünmedim, hepsi önümdeydi. Sen de bu cuma başla. Promotly, ücretsiz.

Avatar videosunu `public/` altına koyup `Story.tsx`'teki ilk iki sahneye yerleştirmek (yarım ekran avatar + yarım ekran uygulama) birkaç satırlık değişiklik.

## Google Play metinleri (taslak)

**Kısa açıklama (80):** Her cuma 5 dakika. 6 ayda kanıtlarla dolu terfi ve performans dosyası.

**Tam açıklama:**

Performans görüşmesinde "Son 6 ayda neler yaptın?" sorusuna hazır mısın? Çoğumuz sadece son iki haftayı hatırlarız. Promotly, yaptığın işi her hafta 5 dakikada arşivlemeni ve dönem sonunda kanıtlarla desteklenmiş bir terfi dosyasına dönüştürmeni sağlar.

• Rehberli haftalık kayıt: Ne yaptın, etkisi ne oldu, kanıtı nerede? 4 kısa adım.
• AI haftalık özet (Pro): Kaydını yöneticine iletebileceğin 3 net maddeye çevirir.
• Aylık özet ve çeyrek analizi: Güçlü yönlerin, gelişim alanların, yeni hedeflerin.
• 6 aylık performans ve terfi dosyası (Pro): En önemli katkıların, etkileri ve kanıt linkleriyle.
• CV ve mülakat için STAR başarı hikâyeleri (Pro).
• Cuma hatırlatması: Alışkanlık için her hafta nazik bir bildirim.
• Gizlilik: Şirket sistemlerine bağlanmaz. Arşivini istediğin an indir ya da tek dokunuşla sil.

Ücretsiz planda haftalık kayıt, son 8 haftanın geçmişi ve temel aylık özet bulunur. Promotly Pro aylık veya yıllık abonelikle sunulur; abonelik Google Play hesabından yönetilir ve istediğin zaman iptal edilebilir.

## Yeniden üretme

```bash
npm install
node scripts/voice.mjs      # seslendirme + kelime zamanlamaları → src/voice-manifest.json
node scripts/music.mjs      # arka plan müziği
node scripts/render.mjs     # tüm görseller ve videolar (veya: stills | videos | <id>)
npx remotion studio         # tarayıcıda canlı önizleme ve düzenleme
```
Metinler `src/scripts.js`, görsel başlıkları `src/StoreShot.tsx`. Ekran görüntüleri `raw/` → `public/screens/`.
Uygulamadan yeniden görüntü almak için Metro'yu `EXPO_PUBLIC_MARKETING=1` ile başlat (paywall'da demo notu yerine mağaza abonelik metni, yazım denetimi çizgileri kapalı).
