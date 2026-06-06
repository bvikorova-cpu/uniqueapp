# Plán: oprava 52 nálezov — Anonymous Dating

Postup po fázach. Každá fáza = 1 commit/migration set, otestuje sa pred ďalšou.

## Fáza 1 — Kritické backend bugs (Day 1)
Cieľ: zastaviť stratu peňazí a privacy leaky.

1. **Migration: anonymous_dating hardening**
   - `UNIQUE(user_id)` na `anonymous_dating_credits`
   - DB trigger na `anonymous_dating_matches`: blokuje `UPDATE status='revealed'` ak nie sú `user1_revealed=true AND user2_revealed=true`
   - Audit + tightening RLS INSERT policy na `anonymous_dating_matches` (povolené len edge functions cez service role; klient nesmie insertovať)
   - RPC `deduct_anonymous_credits(user_id, amount)` — atomický `UPDATE ... WHERE credits_remaining >= amount RETURNING` (rieši double-spend)
   - `WITH CHECK` na `daily_questions` RLS
   - Server enforcement expirácie matchu: cron alebo trigger nastaví `status='expired'` po `expires_at`

2. **Edge `stripe-webhook`**: pridať handler pre `type:"anonymous_date_credits"` v `checkout.session.completed` → kredituje `anonymous_dating_credits` + zápis do `payment_records`.

3. **Edge `find-anonymous-match` + `anonymous-date-ai`**: nahradiť SELECT→UPDATE pattern volaním nového RPC `deduct_anonymous_credits`. Pridať blocked_users check pred AI volaním.

4. **Edge `check-access`**: odstrániť DB mutáciu cez email lookup (read-only).

5. **Fix 24h vs 7d**: zjednotiť na 7 dní (DB `expires_at = now()+7d`, frontend countdown číta z DB).

## Fáza 2 — Backend medium + bezpečnosť (Day 2) ✅
6. ✅ Zod validácia v `anonymous-date-ai` aj `find-anonymous-match` (max lengths 4000, max 50 msgs).
7. ✅ PII sanitizácia v `anonymous_date_ai_usage.input_data` (len structural fingerprint).
8. ✅ Jednotný error handling cez `errorResponse(code, message, status)` helper v `_shared/anonymous-dating.ts`.
9. ✅ Rate limiting cez `check_anon_dating_rate_limit` RPC (AI 20/min, match 30/min) + `mt_rate_limits` unique index.

## Fáza 3 — Frontend stabilita (Day 3)
10. `AnonymousChat`: `isMounted` ref, AbortController, cleanup subscriptions, debounce `broadcastTyping` (300ms).
11. `useAnonymousDate`: cache `supabase.auth.getUser()` (1× na mount), typed `ActiveMatch[]` namiesto `any[]`.
12. `RevealLock`: optimistic lock cez podmienený UPDATE (`WHERE reveal_request_at IS NULL`), eliminuje race.
13. `ProfileSetup`: Zod schema + react-hook-form, stepper UI, error messages.
14. `VoiceRecorderButton`: `maxDuration=60s`, cleanup MediaRecorder.

## Fáza 4 — Frontend dizajn/sémantika (Day 4)
15. Nahradiť všetky hardcoded farby (`text-pink-500`, `from-pink-500`) sémantickými tokenmi (`text-primary`, gradient utility z index.css).
16. Pridať `--anon-date-*` tokeny do index.css (pink/purple gradient, glow shadow).
17. Mobile: `vh` → `dvh` na chat layout, safe-area insets.
18. Unifikovať EN copy (audit & nahradiť SK reťazce v komponentoch).

## Fáza 5 — UX kritické (Day 5)
19. **AdultWarningModal**: pridať DOB pole (uloženie do `anonymous_dating_profiles.dob_verified_at`), block <16.
20. **Chat expirácia**: banner 24h pred expiráciou + push notifikácia + post-expiry CTA „Find new match".
21. **CreditPackages**: zobraziť €/credit a savings %.
22. **ProfileSetup stats**: nahradiť `—` reálnymi metrikami (matches, AI uses) alebo skryť.
23. **ChatSafetyMenu**: presunúť shield icon mimo `⋮` menu, viditeľný v headeri.

## Fáza 6 — UX polish (Day 6)
24. AI Toolbox dostupný priamo z chatu (drawer).
25. Reaction discoverability hint (tooltip pri prvom hover).
26. Empty states pre 0 matchov / 0 kreditov s ilustráciou.
27. Skeleton loaders namiesto spinnerov.
28. Toast confirmácie pre block/report.

## Fáza 7 — Testy & monitoring (Day 7)
29. E2E test: payment → credit grant (webhook simulácia).
30. E2E test: reveal flow (unilateral attack musí failnúť).
31. E2E test: double-spend kreditov (paralelné requesty).
32. RLS test suite pre všetky `anonymous_dating_*` tabuľky.
33. Edge function logs review + alerting na 5xx.

## Technické poznámky
- Žiadne breaking changes pre existujúce páry — migrácia `expires_at` len pre nové matche; staré nechať, ale pridať warning UI.
- Všetky migrácie idempotentné (`IF NOT EXISTS`, `CREATE OR REPLACE`).
- Po každej fáze: `bunx vitest run` + manuálny smoke v preview.

## Odhad
~7 pracovných dní. Najdôležitejšie sú Fázy 1–2 (peniaze + privacy). Fázy 3–7 možno robiť paralelne ak treba.

Po schválení začínam **Fázou 1** (1 migrácia + 3 edge function úpravy).
