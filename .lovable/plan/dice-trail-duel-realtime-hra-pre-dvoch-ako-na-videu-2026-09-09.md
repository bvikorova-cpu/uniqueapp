# Dice Trail Duel — realtime hra pre dvoch (ako na videu)

Nový modul `/dice-duel`: dvaja hráči (červená vs modrá) kreslia čiary po mriežke bodiek. Hod kockou 1–6 určí smer čiary, kto sa prvý dostane na spodný riadok, vyhráva. Online 1v1 cez realtime, v štýle Brain Duel.

## Pravidlá hry
- Mriežka bodiek: 9 stĺpcov × 14 riadkov. Štart: červený a modrý na hornom riadku.
- Mapovanie kocky (podľa videa): 1 = ↓, 2 = ↗, 3 = ↘, 4 = ←, 5 = ↙, 6 = ↓.
- Hráči sa striedajú na ťahu; každý ťah = hod kockou (server-side, férové) + čiara z aktuálnej pozície v hodenom smere (1 krok).
- Čiara nesmie ísť mimo mriežku — ak smer vedie von, ťah sa preskočí.
- Vyhráva ten, kto prvý dosiahne spodný riadok.

## Databáza
- `dice_duel_matches`: id, player1_id, player2_id, status (waiting/active/finished/abandoned), current_turn, positions jsonb (trail oboch hráčov), stake, winner_id, created_at/finished_at.
- GRANT + RLS: hráči vidia/updatujú iba svoje zápasy; service_role plný prístup. Realtime publication na tabuľku.

## Edge Functions (server = autorita, kocka sa hadže na serveri)
1. `dice-duel-matchmaking` — nájde čakajúci zápas alebo vytvorí nový; vstupný vklad z `ai_credits` (deduct_ai_credits), refund pri zrušení.
2. `dice-duel-roll` — validuje, že je hráč na ťahu, hodí kocku 1–6, dopočíta novú pozíciu, zapíše trail, skontroluje výhru, pri výhre vyplatí výhru víťazovi (add_ai_credits).
3. `dice-duel-forfeit` — vzdanie/opustenie zápasu, výhra pre súpera.

## Kredity
- Online duel: vklad 2 kredity na hráča z `ai_credits`, víťaz berie celý pot 4 kredity. Ledger záznamy `dice_duel_stake` / `dice_duel_win`.
- Bez nového credit systému, bez Stripe.

## Frontend
- Stránka `src/pages/DiceDuel.tsx`: lobby (Find match / aktívny zápas / história), herná doska ako SVG mriežka bodiek s červenou/modrou lomenou čiarou, animovaná kocka, indikátor ťahu, chat-lite voliteľne.
- Realtime cez Supabase channel na riadok zápasu — ťah súpera sa zobrazí okamžite.
- Registrácia: route `/dice-duel`, GlobalSearch, Navbar, domovské menu (Index), About platform.
- English UI (platform default), „How it works“ vysvetlivka.
- Mobile-first, responzívna doska.

## Overenie
- Typecheck, autentifikovaný test matchmaking + roll + win flow cez edge funkcie, kontrola kreditov v DB, Playwright test duelu dvoch sessionov (360×628).
