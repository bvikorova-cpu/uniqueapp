---
name: Battle Coins (game currency)
description: Separate game currency for KitchenStars, Reel Battles, Megatalent and Dice Trail Duel — 1 AI credit = 100 coins, one-way, cosmetics only
type: feature
---

Battle Coins isolate competitive play from purchased AI credits.

- **Wallets are per module** (`kitchenstars`, `reel_battles`, `megatalent`, `dice_duel`): `battle_coins` PK is `(user_id, module)` and `battle_coins_ledger` carries `module`. Coins NEVER transfer between sections.
- All balance changes go through `battle_coins_apply(_user_id, _module, _delta, ...)` (SECURITY DEFINER) — never direct client writes. A legacy 5-arg overload maps `_source` to the module.
- Exchange: `exchange_credits_for_battle_coins(_credits, _module)` — 1 AI credit = 100 coins into that module's wallet. **One-way only**.
- Duel entry costs **100 coins** (1 AI credit) from the module's own wallet. Winner receives **80% of the pot (160 coins) + 10 XP**; 20% goes to that module's monthly pool.
- Coins are spendable **only** on cosmetics: `purchase_battle_cosmetic(_code, _module)` charges the module wallet; ownership/equip is global per user (`equip_battle_cosmetic`).
- Frontend: `useBattleCoins(module)`, `BattleCoinsWallet module=...`, `BattleCosmeticsShop module=...`; `battle-coins-updated` window event refreshes balances.


- **Dice Trail Duel** (`/dice-duel`) runs fully on the `dice_duel` wallet: entry 100 coins, winner 160 coins + 10 XP (no AI credits paid out), leaderboard 1 win = 1 point. Legal reason: prize has no cash value.
