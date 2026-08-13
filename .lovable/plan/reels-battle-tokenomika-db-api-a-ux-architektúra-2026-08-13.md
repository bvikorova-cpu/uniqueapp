# Reels Battle — tokenomika, DB, API a UX architektúra

Cieľ: 1v1 duel krátkych videí s vlastnou hernou menou, plnou gamifikáciou a ochranou hlavných kreditov.

Pozn.: Battle Coins už v projekte existujú (kurz 1 kredit = 100 mincí, vstup 500, výhra 1 000). Tento plán ich pretokenizuje na nové pravidlá a rozšíri o mesačný rebríček, XP odmeny a anti-cheat.

## 1. Menový systém
- `battle_coins` (zostatok) + `battle_coins_ledger` (každý pohyb) zostávajú; všetky zmeny len cez `battle_coins_apply()`.
- Nový kurz: **1 kredit = 10 mincí** (jednosmerne, bez cashoutu). Zmena konštánt v DB RPC aj v `useBattleCoins.ts`.
- Ledger dostane `is_winnings boolean` — rozlíši nakúpené vs. vyhrané mince (podklad pre rebríček).

## 2. Matematika duelu
- Vstup 10 mincí / hráč, bank 20 mincí.
- Vyhodnotenie: víťaz 16 mincí + 20 XP, porazený 4 mince + 5 XP, provízia 0.
- Prepíšeme `enter_reel_competition` (10 mincí) a `settle_reel_competitions` (rozdelenie 16/4 + XP 20/5 cez `add_user_points`).

## 3. Freemium hráči
- Nová tabuľka `reel_vote_progress(user_id, votes_counted, xp_awarded_total)` — každých 10 odhlasovaných duelov = 1 XP.
- Funkcia `convert_xp_to_battle_coins()`: pri každom náraste XP sa automaticky za každých **1 000 XP** pripíše 10 mincí (spotrebuje XP, zapíše do ledgeru ako `xp_conversion`). Beží v triggeri na `user_xp`.

## 4. Mesačný rebríček
- `reel_monthly_leaderboard(period, user_id, coins_won, rank)` + materializovaný pohľad pre live TOP 20 (refresh cron 2 min) — pokrytie pre veľkú návštevnosť.
- Body = suma mincí z ledgeru s `is_winnings = true` v danom mesiaci.
- Cron `reel-monthly-settlement` (1. deň mesiaca 00:10 UTC) zapíše archív a rozdelí odmeny:
  - 1.: 100 kreditov, zlatá korunka 30 dní, promo na Wall 7 dní, tričko + šiltovka
  - 2.: 50 kreditov, strieborná korunka, promo 3 dni, tričko
  - 3.: 20 kreditov, bronzová korunka, šiltovka
  - 4.–5.: 10 kreditov + odznak „Top 5 Tvorca“
  - 6.–10.: 200 mincí + odznak „Top 10 Tvorca“
- `reel_profile_perks(user_id, perk, expires_at)` drží korunky/odznaky/promo; `reel_physical_rewards(user_id, period, items, fulfillment_status)` pre fyzické ceny — admin ich vybaví v `/admin`, používateľ zadá doručovacie údaje po výhre (bez zobrazovania krajiny/adresy v brandingu, len v objednávke).

## 5. Anti-cheat
- Náhodný matchmaking: RPC `join_reel_queue()` → front `reel_matchmaking_queue`, systém páruje náhodne. Výber súpera z UI sa odstráni.
- `user_devices(user_id, device_hash, last_ip_hash, last_seen)` — hash z fingerprintu prehliadača + IP (hashované, nie plain).
- Párovanie preskočí protihráča so zhodným `device_hash` alebo `ip_hash`; ak nie je nikto vhodný, hráč zostane vo fronte.
- Hlasovanie: 1 hlas / duel / účet (už existuje), plus rate-limit `check_rate_limit('reel.vote', 60, 60)` a blokovanie hlasov z rovnakého device ako účastník duelu.

## 6. UX / UI architektúra
- `/reel-battles` — hero video, zostatok mincí, tlačidlo **Nájdi súpera** (queue stav „Hľadám súpera…“), zoznam bežiacich duelov na hlasovanie (swipe deck 2 videá vedľa seba).
- Duel obrazovka — dva reels, hlasovanie jedným ťapnutím, countdown do konca, komentáre.
- Peňaženka — výmena kreditov (1 : 10), história pohybov, jasná poznámka „mince sa nedajú vymeniť späť“.
- Progres divákov — pás „Odhlasoval si 7/10 duelov → 1 XP“ a „XP 640/1000 → 10 mincí“.
- Rebríček — mesačný TOP 20 s korunkami, tvoja pozícia, odpočet do konca mesiaca, panel odmien.
- Profil — korunka/odznaky z rebríčka, promované profily sa zobrazia na Wall.

## Technické poznámky
- Zmeny v DB idú jednou migráciou (tabuľky + GRANT + RLS + RPC + cron).
- Frontend: úprava `useBattleCoins.ts`, `ReelBattles.tsx`, `ReelBattlesLeaderboard.tsx`, nové `ReelMatchmaking.tsx`, `VoteProgressCard.tsx`, `MonthlyRewardsPanel.tsx`, `useDeviceFingerprint.ts`.
- KitchenStars ponechá súčasné hodnoty, pokiaľ nepovieš inak (nové pravidlá sú napísané pre Reels).
