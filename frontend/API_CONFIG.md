# API Configuration Guide

## Production (Default)

Frontend varsayılan olarak production API'ye bağlanır:
- **URL**: `https://kariyer-rota-api.magicdigital.org/api`

Herhangi bir yapılandırma gerekmez, direkt kullanılabilir.

## Local Development

Local backend kullanmak için environment variable ayarlayın:

### Yöntem 1: .env Dosyası (Önerilen)

```bash
cd frontend
echo "EXPO_PUBLIC_API_URL=http://localhost:4000/api" > .env
```

### Yöntem 2: Expo Config

`app.json` dosyasına ekleyin:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:4000/api"
    }
  }
}
```

Sonra `api.js` dosyasında kullanın:
```javascript
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl || PRODUCTION_API_URL;
```

## Fiziksel Cihaz ile Test

Telefonunuzdan local backend'e bağlanmak için bilgisayarınızın yerel IP adresini kullanın:

```bash
# IP adresinizi bulun
ifconfig | grep "inet " | grep -v 127.0.0.1
# veya macOS'ta:
ipconfig getifaddr en0

# .env dosyasında kullanın
echo "EXPO_PUBLIC_API_URL=http://192.168.1.X:4000/api" > frontend/.env
```

**Önemli**: Bilgisayarınız ve telefonunuz aynı WiFi ağında olmalı!

## Platform-Specific URLs

- **iOS Simulator**: `http://localhost:4000/api`
- **Android Emulator**: `http://10.0.2.2:4000/api`
- **Physical Device**: `http://YOUR_LOCAL_IP:4000/api`
- **Production**: `https://kariyer-rota-api.magicdigital.org/api` (default)

## Debugging

Development modunda API istekleri console'da loglanır:
- Request URL ve method
- Response status
- Error messages

Logları görmek için Expo Developer Tools'u açın veya terminal'de `npx expo start` çıktısını takip edin.

