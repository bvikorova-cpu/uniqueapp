# Missing Edge Functions Audit — RESOLVED

**Status (2026-06-13):** ✅ 0 chýbajúcich edge funkcií.

## Postup riešenia

Pôvodný audit (271 missing) bol nepresný — nepočítal s `proxyMap.ts`, ktorý
presmerúva legacy názvy na univerzálne routery. Reálne chýbalo iba 35 funkcií,
rozdelené do týchto skupín:

### Fáza 1 — vyriešené (35/35)

1. **17× `check-*-subscription`** → proxied na `check-subscription` s tier param.
2. **8× `*-customer-portal`** → proxied na `check-connect-status` (action=customer_portal).
3. **5× `create-*-payment/checkout`** → proxied na `create-checkout` s product param
   (cooking_credits, f1_currency, kids_drawing, lead_boost, tipster).
4. **2× `verify-*-payment`** → proxied na `verify-payment` (bazaar, gift).
5. **5× samostatné funkcie** — vytvorené ako nové súbory:
   - `check-expired-listings` — cron-style update property_listings
   - `process-scheduled-payouts` — admin payouts trigger
   - `generate-lottery-numbers` — random lottery picker (entertainment)
   - `check-holographic-access` — Stripe sub check pre prod_UO5XctMmRHmIpM
   - `check-time-capsule-access` — Stripe sub + per-capsule purchases

### Údržba

Pre nové frontend `invoke('foo-bar')` volania:
- **Stripe checkout** → pridať do `CHECKOUT_PROXY_MAP` v `src/integrations/supabase/proxyMap.ts`
- **Subscription check** → pridať do `SUBSCRIPTION_CHECK_MAP` v `resolveProxy()`
- **Customer portal** → pridať do `CUSTOMER_PORTAL_MODULES` v `resolveProxy()`
- **Verify** → pridať do `VERIFY_PROXY_MAP`
- **AI modul** → pridať do `AI_PROXY_MAP` (smeruje na `generate-gift-message`)

Re-audit: `node /tmp/audit2.mjs` (skript v `/tmp/audit2.mjs`).
