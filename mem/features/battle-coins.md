---
name: Battle Coins (game currency)
description: Separate game currency for KitchenStars and Reel Battles — 1 AI credit = 100 coins, one-way, cosmetics only
type: feature
---

Battle Coins isolate competitive play from purchased AI credits.

- Wallet: `battle_coins` (balance) + `battle_coins_ledger` (every movement). All balance changes go through `battle_coins_apply()` (SECURITY DEFINER) — never direct client writes.
- Exchange: `exchange_credits_for_battle_coins(_credits)` — 1 AI credit = 100 coins. **One-way only**: coins can never be converted back into AI credits.
- Duel entry in KitchenStars and Reel Battles costs **500 coins** (no AI credits). Winner receives **1 000 coins + 10 XP** via `settle_kitchen_competitions()` / `settle_reel_competitions()`.
- Coins are spendable **only** on cosmetics: `battle_cosmetics` catalog (frame / sticker / badge), purchased with `purchase_battle_cosmetic(_code)`, equipped with `equip_battle_cosmetic(_code, _equip)` (one equipped item per kind).
- Scope: only KitchenStars + Reel Battles. All other modules keep using AI credits.
- Frontend: `useBattleCoins()` hook, `BattleCoinsWallet`, `BattleCosmeticsShop`; `battle-coins-updated` window event refreshes balances.
