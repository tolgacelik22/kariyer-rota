# Quick Fix for Dockerfile Issue

Sunucuda şu komutları çalıştırın:

```bash
cd /opt/magicdigital/kariyer-rota-api

# 1. Git'ten son değişiklikleri çekin
git pull origin main

# 2. Dockerfile'ın güncel olduğunu kontrol edin
cat backend/Dockerfile

# 3. Eğer hala eski satır varsa, manuel olarak düzeltin:
# Dockerfile'dan şu satırı kaldırın:
# COPY db/schema.sql /docker-entrypoint-initdb.d/schema.sql 2>/dev/null || true

# 4. Docker build cache'ini temizleyin
docker compose -p kariyer-rota-api -f compose.prod.yml build --no-cache api

# 5. Tekrar deploy edin
./deploy.sh
```

Alternatif olarak, Dockerfile'ı manuel kontrol edip düzeltin:

```bash
# Dockerfile'ı kontrol edin
cat backend/Dockerfile | grep -A 2 -B 2 "schema.sql"

# Eğer hatalı satır varsa, düzenleyin
nano backend/Dockerfile
# Satır 12'yi (veya ilgili satırı) silin
```

