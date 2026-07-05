---
name: Challenge TOP tier (€5/mo) + monthly winner prize
description: Second challenge subscription tier. TOP = €5/mo, everything in PRO + 500,000 XP GUARANTEED every month (auto) + TOP badge + auto-pinned feed. Monthly winners of Eco/Healthy Challenge (ANY tier) get 1,000,000 AI credits + 5% of the total monthly subscription pool (cash).
type: feature
---

# Challenge TOP (€5/mo) + Monthly Winner Prize

Two tiers on the same `public.challenge_pro_subscribers` table (column `tier`: `'pro'` | `'top'`).

## Stripe wiring
- Product key in `create-checkout`: `challenge_top`, amount `500`, mode `subscription`.
- Subscription metadata: `type = 'challenge_top'`. TOP outranks PRO.

## TOP tier — GUARANTEED monthly grant
- **500,000 XP** automatically credited to TOP subscribers once per Stripe billing period.
- Applied by `sync-challenge-pro` edge function using `top_last_grant_period = "${subId}:${current_period_start}"` to prevent double-grants.
- Notification `type = 'challenge_top_monthly'` sent on grant.

## Monthly winner prize — ALL tiers
Applied inside `public.award_eco_monthly_winner()` and `public.award_healthy_monthly_winner(_month_key)`:

Winner XP ladder:
- Non-subscriber → 100,000 XP
- PRO            → 200,000 XP
- TOP            → 500,000 XP  (in addition to their guaranteed monthly 500k)

Winner extras (every tier, even free):
- **1,000,000 ai_credits** (non-cashable, usable across whole platform)
- **5% cash prize pool** = 5 % of the current active-subscription monthly revenue.
  Computed by `public.challenge_monthly_prize_pool_cents()`:
  `FLOOR(SUM(CASE tier WHEN 'top' THEN 500 WHEN 'pro' THEN 300 END) * 0.05)`.
  Stored on the winners row as `cash_prize_cents` (BIGINT). Payout is a manual/admin Stripe Connect transfer — the value is authoritative in the winners table.

Winners tables gained columns: `credits_awarded BIGINT`, `cash_prize_cents BIGINT` on both `eco_monthly_winners` and `healthy_monthly_winners`.

Credit-ledger reason set before `ai_credits` UPSERT: `app.credit_reason = 'challenge_monthly_winner_prize'`.

## Feed pinning
- Eco & Healthy submit handlers set `boosted_until` = end-of-day UTC for TOP subscribers.

## AI Credits Policy
Approved automatic grants:
1. TOP monthly guaranteed 500,000 XP (no credits) — via `sync-challenge-pro`.
2. Monthly winner 1,000,000 ai_credits — via the two SQL award functions.

Any change that broadens ai_credits grants requires explicit user approval — see `mem/features/ai-credits-policy.md`.

## Frontend
- `useChallengePro()` returns `{ tier, isPro, isTop, activeUntil, subscribe }`.
- `ChallengeProBadge` supports `tier="pro"` (gold leaf) and `tier="top"` (pink/purple crown).
- `ChallengeProUpsell` shows a **prominent yellow winner-prize banner** ("1,000,000 AI credits + 5% of monthly subscription pool") above the PRO / TOP comparison. TOP column advertises the guaranteed 500k XP.
