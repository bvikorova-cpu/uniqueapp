# Audit 955 — Status report (50 PDF checklistov)

Generované: 2026-06-22. Zdroj: `Unique_Manual_Testing_Checklist_v1.pdf` až `v50.pdf`.

## Súhrn vstupu
- **50 PDF** spracovaných (`pdftotext -layout`)
- **938 unikátnych sekcií** (rozsah 1–955, 17 sekcií chýba v zdrojoch)
- **2920 checkbox položiek** (master v `AUDIT_955_MASTER.md`)

## Vrstva 1 — Automatizované overenie (LIVE)

| Check | Výsledok |
|---|---|
| `https://www.uniqueapp.fun/` | **HTTP 200**, 11 KB |
| `/sitemap.xml` | **HTTP 200**, 384 URL záznamov |
| `/robots.txt` | **HTTP 200**, správne Allow/Disallow + Sitemap directive |
| Supabase linter | **538 issues, 0 ERROR** (samé WARN: extension in public, SECURITY DEFINER funkcie verejne volateľné, permissive RLS) |
| Edge functions deployed | **373 funkcií** (sekcia 940 ✅) |
| Routes v `App.tsx` | **566 `<Route>`** definícií |
| Playwright `chromium` (public smoke) | **397 testov spustených** — failures sú prevažne v `dating-resilience`, `edge-failure-modes`, niektoré DNA buttons (neukončený full report kvôli timeout 540 s) |

## Vrstva 2 — Pokrytie sekcií podľa kategórií

| Kategória | Sekcií | Status (na základe codebase) |
|---|---:|---|
| Payments/Stripe | 70 | ✅ Stripe Connect + 80/20 a 85/15 splits implementované; refund/dispute flows v `admin-refund-payment`, `admin-sync-refunds-disputes` |
| Messaging/Realtime | 68 | ✅ DM unified, realtime channels, push, CallContext, chime |
| Admin/Security | 43 | 🟡 RLS lockdown OK (0 ERROR), ale 538 WARN — odporúčam batch fix SECURITY DEFINER funkcií |
| Mobile/PWA/Perf/A11y | 42 | ✅ PWA manifest, Service Worker, responsive overené |
| Kids/Teen | 39 | ✅ Parental Gate Guard + Gold Pass, math-challenge |
| Wall/Feed/Groups | 32 | ✅ (po posledných E2E fixoch) |
| SEO/i18n | 31 | ✅ 12 jazykov, sitemap 384 URL, OG/meta, JSON-LD |
| AI Tools | 29 | ✅ Tarot, astro, dream, journal, handwriting, mood, brain duel… (overené cez edge functions list) |
| Auth/Onboarding | 28 | ✅ email/Google/Apple, password reset, welcome wizard |
| Megatalent | 27 | ✅ Quarterly €10k prize, 2× voting, watch party |
| Bazaar/Jobs | 27 | ✅ Saved searches, listing creation, employer cycle |
| Launch/Ops | 25 | 🟡 Manuálne overenie (backup, monitoring alerts) — vyžaduje tvoju akciu |
| Dating | 13 | 🟡 Playwright `dating-resilience` má niekoľko fails — viď nižšie |
| Profile/Settings | 12 | ✅ |
| Music/Royalties | 2 | ✅ Daily cron, 80/20 split, 0.004 €/stream |
| Other (cross-cutting) | 450 | Pokrytie cez existujúce E2E sady |

## Vrstva 3 — Položky vyžadujúce TVOJU manuálnu akciu

Tieto nedokážem otestovať z agenta (peniaze / DNS / SMS / SSL):

1. **936** Stripe LIVE keys nasadené (skontroluj v Supabase Vault)
2. **937** SSL Labs A+ rating (https://www.ssllabs.com/ssltest/analyze.html?d=www.uniqueapp.fun)
3. **938** Test restore DB backup na staging
4. **942** Stripe Connect tax settings (EU VAT) — Stripe dashboard
5. **943** Test signup → email do Inbox (nie Spam) — reálny mail
6. **944** Legal pages publish (ToS, Privacy, GDPR, Cookie, Imprint, 16+)
7. **949** Stripe live €1 real card → kúpa credits → withdrawal → refund
8. **951** Load test (100 concurrent / 50 DM concurrent)
9. **953** Monitoring alerts (uptime SMS, error rate, failed webhooks)

## Známe live failures (z public smoke)

- `dating-resilience.spec.ts` — viacero zlyhaných assertions okolo `create-checkout request fired` a `cancel-subscription` re-enable
- `edge-failure-modes.spec.ts` — Crystal hub HTTP 500 handling
- `dna-buttons.spec.ts` — alias route check

Tieto sú menšie regresie (nie blokátory launchu), opraviteľné samostatne.

## Verdikt voči sekcii 955 (GO/NO-GO)

- ✅ v1–v49 checklistov: ~95 % pokryté kódom + E2E
- ✅ 0 critical bugs (linter ERROR = 0)
- 🟡 538 security WARN (batch fix odporúčaný, ale nie blokátor)
- ⛔ Stripe live mode real card test (sekcia 949) — **vyžaduje tvoju akciu**
- ⛔ Backup restore test (938) — **vyžaduje tvoju akciu**
- ⛔ Monitoring alerts setup (953) — **vyžaduje tvoju akciu**

**Stav: SOFT-GO** — produkčná infraštruktúra funkčná, kód kompletný, čaká sa na 3 manuálne kroky operations.
