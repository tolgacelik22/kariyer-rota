#!/bin/bash

# Smoke test script for Kariyer Rotası API
# Tests the health endpoint and basic functionality

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default domain
DOMAIN="${1:-kariyer-rota-api.magicdigital.org}"
HEALTH_URL="https://${DOMAIN}/health"
MODULES_URL="https://${DOMAIN}/api/modules"

echo "🧪 Kariyer Rotası API Smoke Test"
echo "   Domain: $DOMAIN"
echo ""

# Test 1: Health endpoint
echo "1️⃣  Testing health endpoint..."
if curl -f -s "$HEALTH_URL" > /dev/null; then
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
    echo -e "${GREEN}   ✅ Health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}   ❌ Health check failed${NC}"
    exit 1
fi

echo ""

# Test 2: Modules endpoint (should return 200 even without auth)
echo "2️⃣  Testing modules endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MODULES_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}   ✅ Modules endpoint accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}   ⚠️  Modules endpoint returned HTTP $HTTP_CODE${NC}"
fi

echo ""
echo -e "${GREEN}✅ Smoke tests completed!${NC}"

