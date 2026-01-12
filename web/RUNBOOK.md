# Kariyer Rota - Production Runbook

## 1. Local Testing
- Start DB: `docker compose up db-web -d`
- Install: `npm install`
- Init DB: `npx prisma db push`
- Dev Server: `npm run dev`

## 2. Webhook Testing
Simulate a Shopier paid order:
```bash
curl -X POST http://localhost:3001/api/shopier/osb \
  -u "your_osb_user:your_osb_pass" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST_123",
    "email": "user@example.com",
    "total_amount": "499.00",
    "payment_status": "success",
    "status": "paid"
  }'
```

## 3. Manual Premium Unlock
If a user paid but wasn't unlocked:
- Ask for their email.
- Access DB: `npx prisma studio`
- Find user by email and set `isPremium: true`.
- Or, use the internal verify endpoint if they are logged in: `/api/shopier/verify`.

## 4. Analytics
- Access `/admin?token=YOUR_ADMIN_TOKEN` to see conversion funnel and latest logs.

## 5. Deployment
Ensure the following ENV variables are set in production:
- `DATABASE_URL`: Postgres connection string
- `JWT_SECRET`: Random string
- `ADMIN_TOKEN`: Secure string for admin access
- `SHOPIER_OSB_USER/PASS`: Credentials provided to Shopier for OSB
- `SMTP_*`: Standard mail settings
