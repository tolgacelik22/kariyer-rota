#!/bin/bash

# Kariyer Rotası Production Deploy Script
# This script deploys the API to production using Traefik

set -e  # Exit on error

# Project name for isolation
PROJECT_NAME="kariyer-rota-api"
COMPOSE_FILE="compose.prod.yml"
ENV_FILE=".env.prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Kariyer Rotası API Production Deploy${NC}"
echo ""

# Check if .env.prod file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  $ENV_FILE dosyası bulunamadı.${NC}"
    if [ -f "env.prod.example" ]; then
        echo -e "${YELLOW}   env.prod.example'dan kopyalanıyor...${NC}"
        cp env.prod.example "$ENV_FILE"
        echo -e "${RED}⚠️  ÖNEMLİ: $ENV_FILE dosyasını düzenleyip JWT_SECRET ve database bilgilerini güncelleyin!${NC}"
        exit 1
    else
        echo -e "${RED}❌ env.prod.example dosyası bulunamadı!${NC}"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Validate required variables
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production-min-32-chars" ]; then
    echo -e "${RED}❌ JWT_SECRET değiştirilmemiş! Lütfen $ENV_FILE dosyasında güçlü bir JWT_SECRET belirleyin.${NC}"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your-secure-database-password-change-this" ]; then
    echo -e "${RED}❌ POSTGRES_PASSWORD değiştirilmemiş! Lütfen $ENV_FILE dosyasında güvenli bir şifre belirleyin.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı. Lütfen Docker'ı yükleyin.${NC}"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose bulunamadı. Lütfen Docker Compose'u yükleyin.${NC}"
    exit 1
fi

# Use docker compose or docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Docker ve Docker Compose bulundu${NC}"

# Check if traefik-net network exists
if ! docker network ls | grep -q traefik-net; then
    echo -e "${YELLOW}⚠️  traefik-net network bulunamadı. Oluşturuluyor...${NC}"
    docker network create traefik-net || {
        echo -e "${RED}❌ traefik-net network oluşturulamadı. Lütfen Traefik'in çalıştığından emin olun.${NC}"
        exit 1
    }
fi

# Pull latest code (if in git repo)
if [ -d ".git" ]; then
    echo "📥 Git'ten güncel kod çekiliyor..."
    git pull || echo -e "${YELLOW}⚠️  Git pull başarısız, devam ediliyor...${NC}"
fi

# Stop existing containers (optional, but recommended)
echo "🛑 Mevcut container'lar durduruluyor..."
$COMPOSE_CMD -p "$PROJECT_NAME" -f "$COMPOSE_FILE" down || true

# Build and start services
echo "🔨 Servisler build ediliyor ve başlatılıyor..."
$COMPOSE_CMD -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --build

# Wait for services to be ready
echo "⏳ Servislerin hazır olması bekleniyor..."
sleep 10

# Check if services are running
echo ""
echo "🔍 Servis durumu:"
$COMPOSE_CMD -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps

# Wait for API to be healthy
echo ""
echo "🏥 API health check..."
MAX_RETRIES=30
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "https://${PRODUCTION_DOMAIN}/health" > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Deneme $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✅ API başarıyla çalışıyor!${NC}"
else
    echo -e "${YELLOW}⚠️  API henüz hazır değil veya health check başarısız.${NC}"
    echo "   Logları kontrol edin: $COMPOSE_CMD -p $PROJECT_NAME -f $COMPOSE_FILE logs api"
fi

# Run database migrations (idempotent)
echo ""
echo "📊 Database migration'ları kontrol ediliyor..."

# Check if modules table exists and has data
MODULE_COUNT=$($COMPOSE_CMD -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM modules;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$MODULE_COUNT" = "0" ] || [ -z "$MODULE_COUNT" ]; then
    echo "📦 Modül verileri database'e aktarılıyor..."
    $COMPOSE_CMD -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T api node db/migrate-modules.js || {
        echo -e "${YELLOW}⚠️  Modül migration'ı çalıştırılamadı. Manuel olarak çalıştırın:${NC}"
        echo "   $COMPOSE_CMD -p $PROJECT_NAME -f $COMPOSE_FILE exec api node db/migrate-modules.js"
    }
else
    echo -e "${GREEN}✅ Modüller zaten database'de ($MODULE_COUNT modül)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deploy tamamlandı!${NC}"
echo ""
echo "📋 Bilgiler:"
echo "   🌐 API URL: https://${PRODUCTION_DOMAIN}"
echo "   🏥 Health Check: https://${PRODUCTION_DOMAIN}/health"
echo ""
echo "📝 Yararlı Komutlar:"
echo "   Logları görüntüle: $COMPOSE_CMD -p $PROJECT_NAME -f $COMPOSE_FILE logs -f api"
echo "   Servisleri durdur: $COMPOSE_CMD -p $PROJECT_NAME -f $COMPOSE_FILE down"
echo "   Servis durumu: $COMPOSE_CMD -p $PROJECT_NAME -f $COMPOSE_FILE ps"
echo "   Database'e bağlan: $COMPOSE_CMD -p $PROJECT_NAME -f $COMPOSE_FILE exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB"
