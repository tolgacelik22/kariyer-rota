#!/bin/bash

# Kariyer Rotası Production Deploy Script
# Bu script projeyi production ortamına deploy eder

set -e  # Exit on error

echo "🚀 Kariyer Rotası Production Deploy Başlatılıyor..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı. .env.example'dan oluşturuluyor...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${RED}⚠️  ÖNEMLİ: backend/.env dosyasını düzenleyip JWT_SECRET ve database bilgilerini güncelleyin!${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı. Lütfen Docker'ı yükleyin.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose bulunamadı. Lütfen Docker Compose'u yükleyin.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker ve Docker Compose bulundu${NC}"

# Stop existing containers
echo "🛑 Mevcut container'lar durduruluyor..."
docker-compose down || true

# Pull latest images (if using remote images)
echo "📥 Güncel image'lar çekiliyor..."
docker-compose pull || true

# Build backend image
echo "🔨 Backend image'ı build ediliyor..."
docker-compose build --no-cache backend

# Initialize database schema
echo "🗄️  Database schema'sı oluşturuluyor..."
docker-compose up -d db

# Wait for database to be ready
echo "⏳ Database'in hazır olması bekleniyor..."
sleep 5

# Run database migrations
echo "📊 Database schema'sı oluşturuluyor..."
docker-compose exec -T db psql -U postgres -d kariyerrota < backend/db/schema.sql || {
    echo -e "${YELLOW}⚠️  Schema dosyası doğrudan çalıştırılamadı. Container içinden çalıştırılıyor...${NC}"
    docker-compose exec -T db bash -c "PGPASSWORD=password psql -U postgres -d kariyerrota -f /docker-entrypoint-initdb.d/schema.sql" || true
}

# Run module migration (import modules from data_v2.js to database)
echo "📦 Modül verileri database'e aktarılıyor..."
docker-compose exec -T backend node db/migrate-modules.js || {
    echo -e "${YELLOW}⚠️  Modül migration'ı çalıştırılamadı. Manuel olarak çalıştırın:${NC}"
    echo "   docker-compose exec backend node db/migrate-modules.js"
}

# Start all services
echo "🚀 Tüm servisler başlatılıyor..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Servislerin hazır olması bekleniyor..."
sleep 10

# Check if services are running
echo "🔍 Servis durumu kontrol ediliyor..."
docker-compose ps

# Test backend health
echo "🏥 Backend health check..."
sleep 5
if curl -f http://localhost:4000/api/modules > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend başarıyla çalışıyor!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend henüz hazır değil. Logları kontrol edin: docker-compose logs backend${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deploy tamamlandı!${NC}"
echo ""
echo "📋 Sonraki Adımlar:"
echo "1. Backend loglarını kontrol edin: docker-compose logs -f backend"
echo "2. Database loglarını kontrol edin: docker-compose logs -f db"
echo "3. Backend API'yi test edin: curl http://localhost:4000/api/modules"
echo ""
echo "🔗 Backend URL: http://localhost:4000"
echo "📊 Database: localhost:5432"
echo ""
echo "🛑 Servisleri durdurmak için: docker-compose down"
echo "📝 Logları görmek için: docker-compose logs -f"

