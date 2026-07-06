# Fáza 3 — Čiastočne wired stránky (odhad 10–15 h)

Cieľ: doplniť chýbajúce read/write cesty pre 8 modulov, ktoré už majú UI + subscription/auth check, ale kľúčové akcie zatiaľ neukladajú stav ani nezobrazujú reálne dáta.

## Overený stav (po rýchlom audite)

| Modul | Aktuálne | Chýba |
|---|---|---|
| ComedyClub | UI hub bez query | tabuľka `comedy_shows` + list |
| HorseRacing | subscription OK, `handleBuyHorse` calluje `mutate` | edge fn `horse-racing-action` (buy/race/train) |
| LotteryAI | číta `lottery_generations`, subscription OK | edge fn `lottery-ai-action` (save-pick, submit-ticket) |
| PhobiaTrading | číta stats, subscription OK | edge fn `phobia-trading-action` (place-trade, journal) |
| GPRacingArena | subscription OK, dialogy hotové | edge fn `gp-racing-action` (buy-car, join-race, shop) |
| HealthcareProviderDashboard | `healthcare_collections` list + create už OK | tabuľky `healthcare_appointments`, `healthcare_referrals` + query |
| education/SkillTree | `education_skill_tree_nodes` read OK | edge fn `education-skill-unlock` (write progress + XP) |
| education/StudyGroups | create/join priamo cez client insert (RLS-závislé) | edge fn `education-study-group-action` na atomické create/join + validáciu invite kódu |

## Deliverables

### 1. DB migrácia (jedna)
- `comedy_shows(id, host_id, title, description, venue, starts_at, price_cents, status)` + GRANTs (anon SELECT ak `status='published'`) + RLS + indexy
- `healthcare_appointments(id, provider_id, patient_id, scheduled_at, status, notes)` + RLS (provider aj patient vidia svoje)
- `healthcare_referrals(id, from_provider_id, to_provider_id, patient_id, reason, status)` + RLS
- Ak už existujú súvisiace tabuľky pre horse/gp/lottery/phobia game state, iba pridám chýbajúce polia; ak nie, vytvorím minimálne: `horse_race_entries`, `gp_race_entries`, `lottery_saved_picks`, `phobia_trades` (id, user_id, kľúčové polia, created_at) + RLS `auth.uid() = user_id`
- Trigger `update_updated_at_column` kde treba
- Zapnem realtime len na `comedy_shows` (verejné) — ostatné netreba

### 2. Edge functions (6 nových)
Všetky s CORS, JWT validáciou cez `SUPABASE_SERVICE_ROLE_KEY`, Zod validáciou, credit check kde relevantné:
- `horse-racing-action` — akcie `buy-horse | enter-race | train`
- `gp-racing-action` — akcie `buy-car | join-race | shop-purchase`
- `lottery-ai-action` — akcie `save-pick | submit-ticket`
- `phobia-trading-action` — akcie `place-trade | write-journal`
- `education-skill-unlock` — validuje prerequisites, zapíše `education_user_skill_progress`, pripočíta XP
- `education-study-group-action` — atomické `create | join-by-code | leave`, kontrola limitu členov

### 3. UI wiring
- ComedyClub: query `comedy_shows` (upcoming + past), grid card layout, empty state
- HealthcareProviderDashboard: nové taby "Appointments" + "Referrals" so zoznamom + status badges
- HorseRacing / GPRacing / LotteryAI / PhobiaTrading: nahradiť priame client inserts / mock handlers volaním nových edge fn cez `useMutation`
- SkillTree: "Unlock" button → volá `education-skill-unlock`, optimistic update
- StudyGroups: create/join tlačidlá → volajú `education-study-group-action` (existujúce client inserts nahradím)

### 4. Testy
- `src/test/phase3-wire.test.ts` — verifikuje, že každý z 8 modulov importuje aspoň jeden Supabase call (buď `.from(` alebo `functions.invoke(`)
- Rozšíriť `src/test/module-edge-functions-group8.test.ts` (alebo pridať group9) o novú šesticu edge fn

## Postup
1. Migrácia (samostatný krok, čaká na tvoj OK)
2. Po schválení: paralelne edge functions + UI wiring + testy
3. Report + Playwright smoke na public routách (ComedyClub, verejné časti)

## Otvorené otázky
- **Credit cost** pre horse/gp/lottery/phobia akcie: navrhujem 2 kredity za akciu (place-bet, train, save-pick, place-trade). OK?
- **Comedy shows** — kto môže vytvárať? Iba používatelia s `has_role('comedian')` alebo hocikto? (default: iba komedianti s existujúcim profilom)
- **Healthcare appointments** — chceš aj booking flow z pacientovej strany, alebo len read pre providera v tomto kroku? (default: len read pre providera, booking flow ide do Fázy 4/5)
