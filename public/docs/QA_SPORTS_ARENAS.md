# QA Test Plan — SPORTS ARENAS

URL po publikovaní: `https://www.uniqueapp.fun/docs/QA_SPORTS_ARENAS.md`

Pokrýva 8 modulov zo screenshotu:
1. Character Arena — `/character-arena`
2. Horse Racing Arena — `/horse-racing-arena`
3. Football Arena — `/football-arena`
4. Basketball Arena — `/basketball-arena`
5. Hockey Arena — `/hockey-arena`
6. Tennis Arena — `/tennis-arena`
7. American Football — `/american-football-arena`
8. GP Fantasy Racing — `/gp-fantasy-racing`

---

## 0. PRÍPRAVA (povinné pred testovaním)

### 0.1 Testovacie účty
Vytvor 4 účty (rôzne emaily, rôzne browsery/inkognito okná):
- **U1 (Host/Owner)** — 200 kreditov, Stripe Connect aktívny, KYC OK
- **U2 (Challenger)** — 100 kreditov, štandardný hráč
- **U3 (Voter/Fan)** — 50 kreditov, len pozerá a hlasuje
- **U4 (Admin)** — admin rola v `user_roles`, prístup k moderácii

### 0.2 Stripe test karty (EUR)
- Success: `4242 4242 4242 4242`
- 3DS Required: `4000 0027 6000 3184`
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

### 0.3 Pred-flight checklist
- [ ] Currency je EUR (€) — žiadne USD/CZK/HUF nikde
- [ ] Jazyk EN default, prepnúť na SK a späť — preklady kompletné
- [ ] Light mode default, prepnúť dark mode → ostane po reloade
- [ ] DevTools otvorené (Console + Network)
- [ ] Mobilný viewport 360×640 + desktop 1440×900

---

## 1. CHARACTER ARENA (`/character-arena`)

### 1.1 Vstup a UI
1. Otvor `/character-arena` ako U1
2. Skontroluj: hero banner, zoznam aktívnych zápasov, leaderboard, tlačidlo "Create Battle"
3. Hover/tap na kartu zápasu → preview s power statistikami
4. Filter: All / Live / Upcoming / Finished — overuj počty

### 1.2 Vytvorenie battle (U1)
1. Klik "Create Battle" → modal/wizard
2. Vyber svoju postavu (alebo vytvor novú — meno, avatar, popis)
3. Nastav stake (napr. 20 kreditov), max round count, public/private
4. Submit → overiť že balance kreditov klesol o 20 (Network: `POST /functions/v1/credits-deduct`)
5. Battle sa zjaví v zozname Upcoming

### 1.3 Pripojenie protihráča (U2)
1. U2 otvorí ten istý battle → klik "Join Challenge"
2. U2 vyberie postavu, potvrdí stake 20 kreditov
3. Overiť: balance U2 -20, status battle = Live
4. U1 vidí real-time notifikáciu "Opponent joined" (Supabase Realtime channel)

### 1.4 Round mechanika
1. U1 zvolí akciu (Attack/Defend/Special) → submit
2. U2 to isté nezávisle
3. Po oboch akciách → server vypočíta výsledok (battle_power.ts) → animácia
4. Zopakuj pre všetky kolá
5. Po poslednom kole: víťaz dostane pool (40 − fee), loser 0
6. Overiť split: 80/20 (winner/platform) — `mem/features/fee-rates`

### 1.5 Hlasovanie (U3)
1. U3 otvorí prebiehajúci battle → "Vote for character"
2. Stake malý počet kreditov (5) na U1
3. Ak U1 vyhrá → U3 dostane proporcionálny podiel z voter pool
4. Ak U1 prehrá → U3 stratí 5 kreditov
5. Overiť ledger v `/wallet` alebo `/credits`

### 1.6 Edge cases
- [ ] U2 sa pokúsi joinnúť battle ktorý už začal → blokované
- [ ] U1 sa pokúsi joinnúť vlastný battle ako protihráč → blokované
- [ ] Nedostatok kreditov pri Create → toast + redirect na `/credits-store`
- [ ] Refresh stránky uprostred battle → state sa obnoví (RLS check)
- [ ] Dvojklik na "Submit action" → idempotent, kredit sa nestrhne 2×

---

## 2. HORSE RACING ARENA (`/horse-racing-arena`)

### 2.1 UI tour
1. Otvor route — overiť hero, list pretekov (Upcoming/Live/Finished), "My Horses", "Stable"
2. Klik na pretek → detail s koňmi, kurzami, časom štartu

### 2.2 Stajňa a kone (U1)
1. `/horse-racing-arena/stable` → "Buy Horse" (cena v EUR alebo kredity)
2. Kúpa cez Stripe checkout (test karta) → return URL → kôň pribudol
3. Tréning koňa: každý 24h zadarmo, expresný za kredity
4. Overiť atribúty: speed, stamina, agility

### 2.3 Stávky (U1 + U2)
1. U1 prihlási koňa do preteku (entry fee napr. 10 €)
2. U2 stávka 5 € na U1 koňa, U3 stávka 5 € na iného
3. Po štarte: live animácia, leaderboard počas behu
4. Výsledok: vyplatenie podľa kurzov; overiť ledger transakcie
5. House edge: 5% — porovnaj s `feeRates.ts`

### 2.4 Multi-user race lobby
1. U1, U2, U3 vstúpia do toho istého multiplayer lobby
2. Každý vyberie svojho koňa
3. Štart manuálny (host) alebo automatický (countdown)
4. Real-time pozície cez Realtime channel — overiť sync na 3 zariadeniach

### 2.5 Edge cases
- [ ] Pokus o stávku po štarte → blokované
- [ ] Pretek bez účastníkov → cancelled, refund
- [ ] Stripe webhook fail → stávka nezapočítaná (idempotency key)

---

## 3. FOOTBALL ARENA (`/football-arena`)

### 3.1 UI a režimy
1. Otvor route — režimy: **Quick Match**, **Tournament**, **Manager Mode**, **Predictions**
2. Skontroluj tabuľku, fixtures, top scorers

### 3.2 Quick Match (U1 vs U2)
1. U1 klik "Find Match" → matchmaking queue
2. U2 to isté → spárovaní
3. Mini-hra alebo simulácia → ukončenie do 5 min
4. Víťaz získa XP + kredity (stake-based)

### 3.3 Tournament (4+ hráči)
1. U1 vytvorí turnaj (8-player bracket, entry 10 €)
2. U2, U3, + 5 ďalších sa pridajú
3. Bracket sa vyplní → kolá: QF → SF → Final
4. Prize pool: 70% víťaz, 20% finalista, 10% SF
5. Overiť: každý match má vlastný record, RLS = len účastníci vidia detaily

### 3.4 Predictions
1. Pred zápasom (reálnym/virtuálnym) U3 stávka výsledok (1/X/2)
2. Overiť deadline → po deadline stávky zamknuté
3. Po skončení → automatický settlement (cron alebo manual admin)

### 3.5 Manager Mode
1. U1 zostaví tím (11 hráčov z poolu)
2. Stratégia: formation, tactics
3. Simulácia zápasu vs CPU alebo iný manažér
4. Score updates real-time

### 3.6 Edge cases
- [ ] Disconnect uprostred quick match → 30s reconnect, potom forfeit
- [ ] Tournament bracket s nepárnym počtom → bye round
- [ ] Predictions po deadline → 403

---

## 4. BASKETBALL ARENA (`/basketball-arena`)

### 4.1 Štandardné kroky (rovnaký template ako Football)
1. UI tour: režimy 1v1, 3v3, 5v5, League, Predictions
2. Quick match U1 vs U2 — shooting mini-game alebo sim
3. League — 8 týždňov, fixtures, standings
4. Trade Hub — výmena hráčov medzi U1 a U2 (offer/accept flow)

### 4.2 Multi-user 3v3
1. U1 vytvorí team (názov, logo, primárny color)
2. Pozve U2, U3 → akceptujú v notifikáciách
3. Team challenge proti inému teamu (4 hráči potrebuje matchmaker)
4. Po skončení: štatistiky per hráč (points, rebounds, assists)

### 4.3 Edge cases
- [ ] Team owner odíde → ownership transfer flow
- [ ] Hráč v 2 teamoch súčasne → blokované

---

## 5. HOCKEY ARENA (`/hockey-arena`)

### 5.1 Sekcie
1. Quick Match, League, Penalty Shootout, Fantasy Draft
2. Skontroluj ice rink animácie, sound efekty

### 5.2 Penalty Shootout (U1 vs U2)
1. Striedanie: shooter vs goalie role
2. 5 pokusov každý, najlepšie z 5
3. Overiť timing/reaction-based UI
4. Stake-based: víťaz berie pool

### 5.3 Fantasy Draft (4+ hráči)
1. Lobby s draft poolom NHL štýl hráčov
2. Snake draft order
3. Týždenné scoring na základe (simulovaných) real štatistík
4. Sezóna 10 týždňov → playoff

### 5.4 Edge cases
- [ ] Draft timeout (60s na pick) → auto-pick best available
- [ ] Goalie disconnect počas penalty → auto-save = 50%

---

## 6. TENNIS ARENA (`/tennis-arena`)

### 6.1 UI
1. Otvor `/tennis-arena` — režimy: Singles, Doubles, Tournament, ATP/WTA prediction
2. Skontroluj court visual, ranking system (ELO)

### 6.2 Singles match (U1 vs U2)
1. Best of 3 sets, mini-game serve/return
2. Surface selection (Clay/Grass/Hard) — ovplyvňuje stats
3. Po zápase: ELO update viditeľný

### 6.3 Doubles (U1+U2 vs U3+U4)
1. Pozvánky do páru
2. Coordinated play — chat počas zápasu
3. Pool split 50/50 medzi víťazmi

### 6.4 Tournament Grand Slam štýl
1. 16/32/64 bracket, entry fee
2. Seed podľa ELO
3. Final prize: 60/25/10/5

### 6.5 Edge cases
- [ ] Doubles partner odíde → forfeit alebo solo continue (configurable)
- [ ] Tie-break logic na 6:6

Pozri tiež `e2e/tennis-arena-buttons.spec.ts` ako E2E baseline.

---

## 7. AMERICAN FOOTBALL (`/american-football-arena`)

### 7.1 Sekcie
1. Quick Drive, Season Mode, Pick'em League, Fantasy

### 7.2 Quick Drive (U1 vs U2)
1. Coin toss
2. Striedavo offense/defense, play calling (Run/Pass/Special)
3. 4 quarters, sim s animáciami
4. Touchdown/FG/safety scoring

### 7.3 Pick'em League (U1, U2, U3+)
1. Týždenné NFL picks (16 zápasov)
2. Spread + over/under
3. Leaderboard týždeň + sezóna
4. Confidence pool varianta

### 7.4 Fantasy (4-12 hráčov)
1. Draft, lineups, waivers, trades
2. Týždenné scoring
3. Playoff weeks 15-17

### 7.5 Edge cases
- [ ] Late submit lineupu (po kickoff) → blokované
- [ ] Trade veto (commissioner = U1) flow

---

## 8. GP FANTASY RACING (`/gp-fantasy-racing`)

### 8.1 UI
1. Otvor route — sezóna kalendár (24 GP), tvoj team, leaderboard
2. Skontroluj: 2 drivers + 1 constructor budget systém (100M)

### 8.2 Team setup (U1)
1. Klik "Create Team" → mená team, logo
2. Vyber 2 drivers + constructor v rámci budget capu
3. Save → potvrdenie

### 8.3 Race weekend flow
1. Pred kvalifikáciou (deadline T-1h): lineup lock, captain (2× body)
2. Mid-season transfers (limit 2 free/race)
3. Po preteku: skóre auto-výpočet (pozícia, fastest lap, DNF penalty)
4. Leaderboard update

### 8.4 Mini-league (U1, U2, U3, U4)
1. U1 vytvorí privátnu ligu → invite kód
2. Ostatní zadajú kód v "Join League"
3. Vlastný leaderboard medzi ligami
4. Sezónny prize pool (entry fee × počet účastníkov, fee 10%)

### 8.5 Predictions / one-off bets
1. Pred GP: pole position, race winner, podium
2. Stake-based, kurzy dynamic

### 8.6 Edge cases
- [ ] Transfer over budget → blokované
- [ ] Lineup po deadline → predošlý lineup ostáva
- [ ] DNF v Q1 vs race → správne skóre 0 alebo malus

E2E baseline: žiadny dedikovaný — pridať `e2e/gp-fantasy.spec.ts`.

---

## 9. CROSS-MODULE TESTY

### 9.1 Kredity & Wallet
1. Po každom module: skontroluj `/wallet` → ledger entries (debit/credit)
2. Súčet musí sedieť s server-side `credits_ledger`
3. Žiadne duplicitné debits (idempotency)

### 9.2 RLS audit (curl)
Pre každý arena modul tabuľky:
- `character_battles`, `horse_race_bets`, `football_matches`, `basketball_teams`, `hockey_drafts`, `tennis_matches`, `nfl_picks`, `gp_fantasy_teams`
- Skús `GET` cez REST API s tokenom **iného** používateľa → musí vrátiť 0 rows alebo 403 pre cudzie záznamy

```bash
curl -H "Authorization: Bearer $U2_TOKEN" \
  -H "apikey: $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/character_battles?id=eq.<U1_battle_id>"
```
Očakávaný výstup: `[]` ak nie je verejný.

### 9.3 Realtime
1. Otvor U1 a U2 vedľa seba (2 monitory / 2 phone)
2. U1 vykoná akciu → U2 vidí update do 1s
3. Channel cleanup po unmount (žiadne leaks v Network → WS)

### 9.4 Stripe & Payouts
1. Po každom vyplatení: skontroluj `payout_requests` table
2. Admin (U4) v `/admin/payouts` schváli → Stripe Connect transfer
3. Overiť idempotency key v webhookoch

### 9.5 Currency / i18n
- [ ] Žiadny `$`, `USD`, `Kč`, `Ft` na žiadnej arena stránke (grep DevTools)
- [ ] Prepni EN→SK→DE→FR→IT — žiadne chýbajúce kľúče (žiadne `arena.button.xyz`)

### 9.6 Performance
1. Lighthouse pre každú arena route (mobile)
2. Target: Perf ≥ 65, A11y ≥ 90
3. Memory: 10 min hranie → heap < +60MB

### 9.7 Notifikácie
1. Battle invite → in-app bell + push (ak povolené)
2. Match result → notification s deep linkom
3. Klik notifikácie → routuje na konkrétny match (`notificationRoutes.ts`)

---

## 10. SECURITY & ABUSE

### 10.1 Anti-cheat
- [ ] Submitnúť výsledok zápasu cez priamy API call (bypass UI) → server validuje a odmietne
- [ ] Manipulácia client-side state (DevTools) nemení server score
- [ ] Rate limit na "Find Match" → max 10/min (test cez 15 rýchlych klikov)

### 10.2 Privacy
- [ ] Súper nevidí tvoj wallet balance
- [ ] PII (email) nikde v public profile
- [ ] Match chat → PII masking (`maskPII.ts`) aktívny

### 10.3 Moderation (U4 Admin)
1. `/admin/arena-reports` — zoznam nahlásených hráčov
2. Akcie: warn, mute (24h), ban (perm)
3. Banned hráč nevie vstúpiť do žiadnej arena (overiť na všetkých 8 moduloch)

---

## 11. PRIORITIZÁCIA

| Modul | Priorita | Reason |
|-------|----------|--------|
| Character Arena | P0 | Najviac kreditových transakcií |
| Horse Racing | P0 | Stávky + Stripe |
| Football / Basketball | P1 | Vysoký traffic |
| GP Fantasy | P1 | Sezónne preteky, transfers |
| Tennis / Hockey / AmFootball | P2 | Nižší engagement |

**P0 musí byť 100% pred releasom.**

---

## 12. REPORTOVANIE BUGOV

Pre každý nájdený bug:
1. Modul + route
2. Kroky reprodukcie (1, 2, 3…)
3. Expected vs Actual
4. Screenshot + DevTools Console + Network HAR (ak relevantné)
5. User accounts použité (U1/U2/U3/U4)
6. Severity: Critical (blocker) / High / Medium / Low

Šablóna:
```
[Character Arena] U2 nemôže joinnúť battle po Stripe 3DS
Repro: 1) U1 create battle 20€ ... 2) U2 join → 3DS popup ...
Expected: po 3DS confirm → join úspešný
Actual: po confirm → "Battle already started"
Console: 409 Conflict, idempotency_key duplicate
Sev: High
```
