# Promotly (Kariyer Rota) - Runbook

Promotly — Terfi ve Başarı Arşivi. Her cuma 5 dakikalık haftalık kayıt → AI ile aylık / çeyreklik / 6 aylık
performans raporu ve CV için başarı hikâyeleri. B2C abonelik: Ücretsiz, Pro aylık (199 TL), Pro yıllık (1.490 TL).

| Yol | Ne |
|---|---|
| `/` | Açılış sayfası + fiyatlar (fiyat A/B varyantı `pv` çerezinde) |
| `/giris` | E-posta ile sihirli bağlantı girişi (+ KVKK onayı) |
| `/app` | Haftalık kayıt, seri, arşiv (Ücretsiz: son 8 hafta görünür) |
| `/app/raporlar` | Aylık (Ücretsiz = temel özet), çeyrek, 6 aylık dosya, STAR hikâyeleri (Pro, AI) |
| `/app/hesap` | Plan/ödeme, profil, cuma hatırlatması, dışa aktarım (MD/JSON), hesabı silme |
| `/admin?token=` | 6. hafta tutunma, aktif Pro, MRR, fiyat varyantı dönüşümü, olaylar |
| `/analiz` | Eski ücretsiz kariyer anketi (→ `/result`, `/report`) |

## 1. Local demo
```bash
docker compose up db-web -d          # Postgres on :5433
cp .env.example .env                 # fill OPENAI_API_KEY for AI reports
npm install
npx prisma db push
node prisma/seed-demo.mjs            # demo@promotly.local (Pro, 14 hafta), free@promotly.local (Ücretsiz, 7 hafta)
npm run dev                          # http://localhost:3000
```
Without SMTP, `/giris` shows the login link on screen (dev, or `DEMO_MODE=1` with `next start`).

## 2. Production rollout (k3s + ArgoCD, push to main = deploy)
1. **Schema first** (additive: new columns on `User`, new tables `WeeklyEntry`, `Report`) — run against the prod DB
   before the new image starts, e.g. from a machine with the repo: `DATABASE_URL=<prod> npx prisma db push`
   (port-forward `svc/db-web-prod` in namespace `kariyerrota`).
2. Add env to secret `kariyerrota-env`: `OPENAI_API_KEY`, `OPENAI_MODEL`, `CRON_SECRET`, `NEXT_PUBLIC_PRICE_VARIANTS`,
   `SHOPIER_PRO_MONTHLY_URL`, `SHOPIER_PRO_YEARLY_URL`, `SHOPIER_PRO_MONTHLY_PRODUCT_IDS`, `SHOPIER_PRO_YEARLY_PRODUCT_IDS`.
   `NEXT_PUBLIC_*` values are baked in at build time — set them as build args too if they differ from defaults.
3. Scheduler: daily CronJob → `GET https://kariyer.magicdigital.org/api/cron/reminders?secret=$CRON_SECRET`
   (sends the Friday reminder on Fridays, Pro expiry notices every day).

If no Shopier link is configured for a plan, "Pro'ya geç" records a `checkout_clicked` event and shows a waitlist
message — a fake-door price test.

## 3. Payments (Shopier OSB)
`POST /api/shopier/osb` (HMAC-verified, idempotent on order id). Pro plan is detected by product id
(`SHOPIER_PRO_*_PRODUCT_IDS`), customer note `plan:monthly|plan:yearly`, or a checkout click by the same email in
the last hour. Pro is extended by 31 / 366 days from the later of now and the current end date. Shopier is not a
recurring subscription; users get an email 3 days before expiry.

Test a signed notification locally:
```bash
RES=$(node -e 'console.log(Buffer.from(JSON.stringify({email:"x@y.com",orderid:"T-1",price:"199",productid:"111",istest:"1"})).toString("base64"))')
HASH=$(node -e 'console.log(require("crypto").createHmac("sha256",process.env.SHOPIER_OSB_PASS).update(process.argv[1]+process.env.SHOPIER_OSB_USER).digest("hex"))' "$RES")
curl -X POST http://localhost:3000/api/shopier/osb --data-urlencode "res=$RES" --data-urlencode "hash=$HASH"
```

## 4. Manual Pro unlock
```bash
curl -X POST https://kariyer.magicdigital.org/api/admin/grant-pro \
  -H "x-admin-token: $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","plan":"monthly"}'
```
Legacy one-off report buyers: set `isPremium` / `PremiumEntitlement` as before (`/api/shopier/verify`).

## 5. Privacy
- No integrations pull company data; users write summaries and optional evidence links.
- AI reports send entry text to OpenAI (covered by KVKK text v2, explicit consent at login).
- Export (`/api/export?format=md|json`) and full account deletion (`DELETE /api/me`) are free for everyone.
  Payment rows are kept for accounting but unlinked from the deleted user.
