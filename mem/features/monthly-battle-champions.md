---
name: Monthly battle champions (fixed rewards)
description: KitchenStars, Reel Battles and MegaTalent monthly TOP 3 rewards — 5000/2500/1000 AI credits + badges, no cash and no % of entry fees
type: feature
---

Percentage-of-pot cash prizes were dropped (EU gambling risk). Replaced by **fixed monthly rewards**:

- 1st (King): **5 000 AI credits** + gold badge (30 days) + gold name + gold-framed videos
- 2nd: **2 500 AI credits** + silver badge + T-shirt + cap
- 3rd: **1 000 AI credits** + bronze badge

Implementation:
- `battle_monthly_champions` (module, period, rank, user_id, points, credits_awarded, perks[], badge_expires_at) — public read only.
- `settle_monthly_battle_champions(_module, _period)` — SECURITY DEFINER, service_role only, idempotent per module+period; awards credits via `add_ai_credits`. pg_cron `settle-monthly-battle-champions` runs on the 1st of each month for all three modules.
- Points per period: duel win = 100 + votes received (KitchenStars / Reel Battles); MegaTalent = sum of `talent_submissions.votes_count`.
- Frontend: `MonthlyChampionRewardsCard`, `ChampionBadge`, `useChampionBadges` / `championRankClasses` (gold/silver/bronze ring + name colour). `MonthlyPrizePoolCard` was deleted.
- Battle Coins duel economy (500 entry / 1000 prize) stays unchanged.
