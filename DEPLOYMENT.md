# Production Deployment Guide

Bu dokümantasyon, Kariyer Rotası API'sini Hetzner sunucusunda Traefik ile deploy etmek için gerekli adımları içerir.

## Ön Gereksinimler

- Hetzner sunucusu
- Docker ve Docker Compose kurulu
- Traefik container'ı `traefik-net` network'ünde çalışıyor
- Let's Encrypt resolver `letsencrypt` adıyla yapılandırılmış

## Deployment Adımları

### 1. Repository'yi Clone Edin

```bash
git clone https://github.com/tolgacelik22/kariyer-rota.git
cd kariyer-rota
```

### 2. Environment Variables'ı Ayarlayın

```bash
cp env.prod.example .env.prod
```

`.env.prod` dosyasını düzenleyin ve şu değerleri güncelleyin:

- `JWT_SECRET`: Güçlü bir random string (en az 32 karakter)
- `POSTGRES_PASSWORD`: Güvenli bir database şifresi
- `PRODUCTION_DOMAIN`: `kariyer-rota-api.magicdigital.org` (zaten ayarlı)

**ÖNEMLİ:** `JWT_SECRET` ve `POSTGRES_PASSWORD` mutlaka değiştirilmelidir!

### 3. Deploy Script'ini Çalıştırın

```bash
./deploy.sh
```

Bu script:
- Docker ve Docker Compose kontrolü yapar
- `traefik-net` network'ünün varlığını kontrol eder
- Git'ten son değişiklikleri çeker
- Container'ları build eder ve başlatır
- Database migration'larını çalıştırır
- Health check yapar

### 4. Smoke Test

Deployment sonrası API'nin çalıştığını test edin:

```bash
./scripts/smoke.sh
```

Veya manuel olarak:

```bash
curl https://kariyer-rota-api.magicdigital.org/health
```

## Yönetim Komutları

### Logları Görüntüleme

```bash
docker compose -p kariyer-rota-api -f compose.prod.yml logs -f api
```

### Servis Durumu

```bash
docker compose -p kariyer-rota-api -f compose.prod.yml ps
```

### Servisleri Durdurma

```bash
docker compose -p kariyer-rota-api -f compose.prod.yml down
```

### Servisleri Yeniden Başlatma

```bash
docker compose -p kariyer-rota-api -f compose.prod.yml restart
```

### Database'e Bağlanma

```bash
docker compose -p kariyer-rota-api -f compose.prod.yml exec postgres psql -U postgres -d kariyerrota
```

### Modül Migration'ını Manuel Çalıştırma

```bash
docker compose -p kariyer-rota-api -f compose.prod.yml exec api node db/migrate-modules.js
```

## Troubleshooting

### API Erişilemiyor

1. Traefik loglarını kontrol edin
2. API container'ının çalıştığını kontrol edin: `docker compose -p kariyer-rota-api -f compose.prod.yml ps`
3. API loglarını kontrol edin: `docker compose -p kariyer-rota-api -f compose.prod.yml logs api`

### Database Bağlantı Hatası

1. Database container'ının çalıştığını kontrol edin
2. `.env.prod` dosyasındaki database bilgilerini kontrol edin
3. Database loglarını kontrol edin: `docker compose -p kariyer-rota-api -f compose.prod.yml logs postgres`

### SSL Sertifika Sorunu

1. Traefik'in Let's Encrypt resolver'ının doğru yapılandırıldığını kontrol edin
2. Domain'in DNS kayıtlarının doğru olduğunu kontrol edin
3. Traefik loglarını kontrol edin

## Yapı

- **API**: Node.js/Express backend (Port 3000)
- **PostgreSQL**: Database (Port 5432, internal only)
- **Traefik**: Reverse proxy ve SSL termination (external)

## Network Yapısı

- `traefik-net`: External network (Traefik tarafından oluşturulmuş)
- `default`: Internal network (API ve PostgreSQL arası iletişim)

## Persistent Data

- PostgreSQL data: `kariyer_rota_postgres_data` volume'ünde saklanır
- Container'lar yeniden başlatılsa bile veriler korunur

