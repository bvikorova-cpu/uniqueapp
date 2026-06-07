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

## Fáza 3 — Frontend stabilita (Day 3) ✅ (čiastočne)
10. ✅ `AnonymousChat`: `isMountedRef` + `AbortController` pre moderation invoke, cleanup on unmount.
11. ✅ `useAnonymousDate`: `userIdRef` cache + `onAuthStateChange` invalidation, typed `ActiveMatch[]`.
12. ✅ `RevealLock`: optimistic conditional UPDATE (`reveal_request_at IS NULL` alebo stale >60s, `status='active'`), self-accept guard, requester-only cancel.
13. ✅ `ProfileSetup`: Zod schema (`src/lib/anonymousDatingSchema.ts`) validuje pred submitom, jednotná error message.
13a. ✅ `useAnonymousChat.broadcastTyping`: throttle 1500ms + debounce 300ms (zabráni floodu kanála).
14. ✅ `VoiceRecorderButton` + `useVoiceRecorder`: hard cap 60s s auto-stop pri dosiahnutí limitu, unmount cleanup (MediaRecorder.stop + tracks.stop + interval clear), `cancel()` releases mic.


## Fáza 4 — Frontend dizajn/sémantika (Day 4) ✅
15. ✅ Hot spots (RevealLock, AnonymousChat bubble/input/container) prepnuté na sémantické utility (`bg-anon-date-gradient`, `text-anon-date`, `border-anon-date`). Sekundárne komponenty (Hero, Toolbox, Personality) ponechané — používajú dekoratívne pink/rose ladenie zámerne v rámci dating brandu.
16. ✅ Pridané tokeny `--anon-date-1/2/3/glow/gradient` + utility v `src/index.css`.
17. ✅ Chat layout `h-[calc(100vh-16rem)]` → `.h-anon-chat` (100dvh s vh fallbackom pre staršie prehliadače).
18. ✅ EN-only audit: žiadne SK reťazce v `anonymous-date/` ani v `AnonymousDate.tsx` (overené ripgrepom na diakritiku).


## Fáza 5 — UX kritické (Day 5) ✅
19. ✅ **AdultWarningModal**: DOB pole s validáciou ≥16, persist do `profiles.birth_date`.
20. ✅ **Chat expirácia**: banner 24h pred expiráciou (amber warning) + post-expiry CTA „Find new match" v header AnonymousChat.
21. ✅ **CreditPackages**: zobrazené €/credit + Save % (vs. Basic 0.5€/credit baseline).
22. ✅ **ProfileSetup stats**: skryté (žiadne falošné „—" hodnoty), pripravené na neskoršie zapojenie reálnych metrík.
23. ✅ **ChatSafetyMenu**: shield ikona presunutá z `⋮` na viditeľný emerald "Safety" badge v headeri.

## Fáza 6 — UX polish (Day 6) ✅
24. ✅ AI Toolbox dostupný priamo z chatu cez Sheet drawer (Wand2 button v headeri).
25. ✅ Reaction tooltip ("React with an emoji") na Smile ikone v MessageReactions.
26. ✅ Empty states: ActiveMatches zero-match karta s animovaným srdcom + "Find your match" CTA wired do `setActiveView("find")`. Chat empty state s ikebreaker promptom.
27. ✅ Skeleton loader (4 bubble skeletons) namiesto "Loading conversation…" textu.
28. ✅ Block/report toasty už existujú v `useChatSafety` (block/unblock/report = sonner toasts).

## Fáza 7 — Testy & monitoring (Day 7) ✅ (čiastočne)
29. ✅ Deno unit testy pre `_shared/anonymous-dating.ts` (Zod schémy: max 4000 chars, max 50 msgs, UUID; PII sanitizer; errorResponse) — `supabase/functions/_shared/anonymous-dating.test.ts`.
30. ✅ E2E RLS regression (`e2e/anonymous-dating-profiles-rls.spec.ts`) — anon nemá prístup k `anonymous_dating_profiles` ani `anonymous_dating_matches`; partner-profile columns stále existujú.
31. ✅ E2E partner enrichment (`e2e/anonymous-date-matches.spec.ts`) — viacero partnerov, refresh persistence, swap, fallback, empty state.
32. ✅ Webhook signature enforcement e2e (`e2e/authed/anonymous-dating-security.spec.ts`) — missing-sig + invalid-sig → 4xx, žiadne fake kredity sa nepriznajú. Pozitívna credit-grant cesta zostáva pokrytá manuálnym Stripe test mode (vyžaduje webhook secret v test env).
33. ✅ Reveal-attack guard e2e (single-user) — authed user sa pokúsi PATCHnúť vlastný match na `status='revealed'` + oba `*_revealed=true`; RLS/trigger to musí odmietnuť. Auto-skip ak QA user nemá match.
34. ✅ Double-spend e2e — 10 paralelných `anonymous-date-ai` volaní, asserty: `endBalance ≥ 0`, `debited == successes * cost`, konzistentný integer cost. Auto-skip ak má QA user 0 kreditov.
35. **SKIP** — edge function logs alerting na 5xx (vyžaduje externý monitoring setup — Sentry/DataDog/PagerDuty). Mimo rozsahu tohto projektu.

## Technické poznámky
- Žiadne breaking changes pre existujúce páry — migrácia `expires_at` len pre nové matche; staré nechať, ale pridať warning UI.
- Všetky migrácie idempotentné (`IF NOT EXISTS`, `CREATE OR REPLACE`).
- Po každej fáze: `bunx vitest run` + manuálny smoke v preview.

## Odhad
~7 pracovných dní. Najdôležitejšie sú Fázy 1–2 (peniaze + privacy). Fázy 3–7 možno robiť paralelne ak treba.

Po schválení začínam **Fázou 1** (1 migrácia + 3 edge function úpravy).
