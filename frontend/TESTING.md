# Testing Guide - Production API

## Production API Test

Frontend varsayılan olarak production API'ye bağlanır:
- **API URL**: `https://kariyer-rota-api.magicdigital.org/api`

## Expo ile Test Etme

### 1. Bağımlılıkları Yükleyin

```bash
cd frontend
npm install
```

### 2. Expo'yu Başlatın

```bash
npx expo start
```

### 3. Test Seçenekleri

#### iOS Simulator
```bash
npx expo start --ios
```
veya Expo başladıktan sonra `i` tuşuna basın.

#### Android Emulator
```bash
npx expo start --android
```
veya Expo başladıktan sonra `a` tuşuna basın.

#### Fiziksel Cihaz (Expo Go)
1. Expo Go uygulamasını telefonunuza indirin
2. QR kodu tarayın
3. Uygulama açılacak ve production API'ye bağlanacak

### 4. API Bağlantısını Test Edin

Uygulama açıldığında:
1. Login ekranında "Misafir Olarak Devam Et" butonuna tıklayın
2. KVKK onayını verin
3. İsim girin
4. Dashboard'a yönlendirilmelisiniz

Eğer bağlantı sorunu varsa:
- Console loglarını kontrol edin (Expo Developer Tools)
- Network isteklerini kontrol edin
- API health endpoint'ini test edin: `https://kariyer-rota-api.magicdigital.org/health`

## Local Development (Opsiyonel)

Local backend kullanmak isterseniz:

```bash
# .env dosyası oluşturun
cd frontend
echo "EXPO_PUBLIC_API_URL=http://localhost:4000/api" > .env

# Expo'yu yeniden başlatın
npx expo start --clear
```

**Not**: Local backend için `docker-compose up` ile backend'i çalıştırmanız gerekir.

## Debugging

### API İsteklerini İzleme

Development modunda (`__DEV__ = true`), tüm API istekleri console'da loglanır:
- Request URL ve method
- Response status
- Error messages

### Network Hataları

Eğer network hatası alırsanız:
1. İnternet bağlantınızı kontrol edin
2. API URL'nin doğru olduğunu kontrol edin
3. SSL sertifikasının geçerli olduğunu kontrol edin
4. CORS ayarlarını kontrol edin (backend'de)

### Common Issues

**Problem**: "Network Error" veya "Connection refused"
- **Çözüm**: API URL'nin doğru olduğundan emin olun
- Production: `https://kariyer-rota-api.magicdigital.org/api`

**Problem**: "CORS Error"
- **Çözüm**: Backend'de CORS ayarlarını kontrol edin
- `server.js` dosyasında `app.use(cors())` olmalı

**Problem**: "401 Unauthorized"
- **Çözüm**: Normal, guest login endpoint'i kullanılıyor
- Login ekranında "Misafir Olarak Devam Et" butonuna tıklayın

## Production Build

Production build için:

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

**Not**: EAS (Expo Application Services) hesabı gereklidir.

