---
name: Challenge TOP tier (€5/mo)
description: Second challenge subscription tier. €5/mo → everything in PRO + TOP badge + auto-pinned feed submission. Mega prize (500k XP + 1M AI credits) is a WIN-ONLY reward, granted by the monthly award functions when a TOP subscriber wins.
type: feature
---

# Challenge TOP (€5/mo)

Second tier on top of Challenge PRO (€3/mo). Both live in the same `public.challenge_pro_subscribers` table, differentiated by `tier` column (`'pro'` | `'top'`).

## Stripe wiring
- Product key: `challenge_top` in `create-checkout` (`PRODUCT_DEFAULTS`, amount `500`, mode `subscription`).
- Subscription metadata: `type = 'challenge_top'` — used by `sync-challenge-pro` to classify.
- TOP outranks PRO if a user somehow has both active subs.

## Prizes — WIN-ONLY (no auto monthly grant)
The mega prize is granted ONLY when the TOP subscriber WINS the monthly Eco or Healthy Challenge. `sync-challenge-pro` no longer grants XP or credits; it only mirrors tier state.

Winner XP ladder (per monthly award function):
- Non-subscriber winner → 100,000 XP
- PRO winner            → 200,000 XP
- TOP winner            → 500,000 XP + 1,000,000 ai_credits (non-cashable)

Implemented in:
- `public.award_eco_monthly_winner()`
- `public.award_healthy_monthly_winner(_month_key)`

Both use `public.challenge_tier(user_id)` helper (returns `'top' | 'pro' | null`) and set `app.credit_reason = 'challenge_top_win_prize'` + `app.credit_source = 'award_*_monthly_winner'` before the `ai_credits` UPSERT so the ledger trigger records the source correctly.

## Feed pinning
- Eco & Healthy submit handlers detect an active TOP tier and set `boosted_until` on the submission to end-of-day UTC.
- Existing feed queries already order by `boosted_until DESC`, so TOP submissions naturally rise to the top.

## AI Credits Policy
This is an APPROVED ai_credits grant source, but ONLY via the win path in the two SQL award functions above. Any change that re-introduces an automatic (subscription-time) grant requires explicit user approval — see `mem/features/ai-credits-policy.md`.

## Frontend
- `useChallengePro()` returns `{ tier, isPro, isTop, activeUntil, subscribe }`. `subscribe(target)` where `target` = `'pro'` | `'top'`.
- `useChallengeProSet(userIds)` returns a Set-like object with `.tierOf(id)` for badge rendering.
- `ChallengeProBadge` supports `tier="pro"` (gold leaf) and `tier="top"` (pink/purple crown).
- `ChallengeProUpsell` shows a two-column PRO vs TOP card. TOP benefits list clearly states 500k XP & 1M credits are **win prizes** (contingent on winning the monthly challenge), not a monthly automatic grant.
