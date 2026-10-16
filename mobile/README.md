# Promotly — mobil uygulama

Promotly (Terfi ve Başarı Arşivi) için Expo SDK 58 / React Native uygulaması. Backend, `../web` içindeki Next.js API'sidir.

## Ekranlar

| Ekran | Dosya |
|---|---|
| Tanıtım turu (4 adım) | `src/app/onboarding.tsx` |
| E-posta + 6 haneli kod ile giriş, KVKK onayı | `src/app/login.tsx` |
| Bugün: haftanın durumu, seri, terfi dosyası ilerlemesi, 6. hafta teklifi, ipucu | `src/app/(tabs)/index.tsx` |
| Rehberli haftalık kayıt (4 adım) + kutlama ekranı | `src/app/entry.tsx` |
| Arşiv: aylara göre, etiket filtresi, ücretsizde kilitli eski haftalar | `src/app/(tabs)/archive.tsx` |
| Raporlar + rapor görüntüleme/paylaşma | `src/app/(tabs)/reports.tsx`, `src/app/report/[id].tsx` |
| Paywall (bağlama göre başlık, yıllık/aylık, geri yükleme) | `src/app/paywall.tsx` |
| Profil: plan, kimlik, cuma bildirimi saati, dışa aktarma, hesap silme | `src/app/(tabs)/profile.tsx` |

## Yerelde çalıştırma (Windows)

Repo kökündeki `start-demo.ps1` her şeyi sırayla açar: Postgres (Docker), web API (:3000), Android emülatörü ve Expo.

Elle:
```bash
cd ../web && docker compose up -d db-web && npx next start -p 3000 -H 0.0.0.0   # API
cd ../mobile && npx expo start --android                                        # emülatör / Expo Go
```
Geliştirme sürümünde API adresi otomatik bulunur (emülatör `10.0.2.2:3000`, telefon Metro'nun LAN IP'si). Başka bir sunucu için `EXPO_PUBLIC_API_URL` ver.

Demo hesapları (`node ../web/prisma/seed-demo.mjs`): `demo@promotly.local` (Pro, 14 hafta), `free@promotly.local` (Ücretsiz, 7 hafta). Sunucuda SMTP yoksa ve `DEMO_MODE=1` ise giriş kodu ekranda gösterilir.

## Ödemeler

- **Mağaza modu** (development/production build + anahtarlar): RevenueCat (`react-native-purchases`). `EXPO_PUBLIC_RC_IOS_KEY`, `EXPO_PUBLIC_RC_ANDROID_KEY`; entitlement adı `pro`, offering'de `MONTHLY` ve `ANNUAL` paketleri. Uygulama `Purchases.logIn(user.id)` çağırır; RevenueCat webhook'u `POST /api/revenuecat/webhook` (`Authorization: Bearer $REVENUECAT_WEBHOOK_SECRET`) `proUntil`'i günceller.
- **Demo modu** (web önizleme, Expo Go, anahtar yok): satın alma, sunucunun `DEMO_MODE=1` iken açık olan `/api/dev/pro` ucuna gider. Üretimde bu uç 404 döner.

iOS'ta dijital abonelik App Store içi ödeme ile satılmalıdır; Shopier bağlantısı yalnızca web içindir.

## Bildirimler

Cuma hatırlatması, `expo-notifications` ile cihazda planlanan haftalık yerel bildirimdir (sunucu/push token gerekmez). İzin, ilk kayıt kaydedildiğinde istenir. Expo Go'nun Android sürümünde bu modül tam değildir; orada atlanır, development/production build'de çalışır.

## Derleme

```bash
npx eas-cli@latest build --profile preview --platform android   # dağıtılabilir APK
npx eas-cli@latest build --profile production --platform all
```
Gerçek ödeme testi için RevenueCat anahtarlarını EAS ortam değişkeni olarak ekle.

## Kontroller

```bash
npx tsc --noEmit
npx expo lint
```
