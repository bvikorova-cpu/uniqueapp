---
name: Challenge TOP tier (€5/mo)
description: Second challenge subscription tier. €5/mo → everything in PRO + 500k XP + 1M ai_credits monthly (non-cashable) + TOP badge + auto-pinned feed submission.
type: feature
---

# Challenge TOP (€5/mo)

Second tier on top of Challenge PRO (€3/mo). Both live in the same `public.challenge_pro_subscribers` table, differentiated by `tier` column (`'pro'` | `'top'`).

## Stripe wiring
- Product key: `challenge_top` in `create-checkout` (`PRODUCT_DEFAULTS`, amount `500`, mode `subscription`).
- Subscription metadata: `type = 'challenge_top'` — used by `sync-challenge-pro` to classify.
- TOP outranks PRO if a user somehow has both active subs.

## Bonuses (monthly, once per Stripe billing period)
Granted inside `sync-challenge-pro` after tier is resolved:
- **+500,000 XP** via `add_user_points(p_user_id, 500000, 'challenge_top_monthly', meta)`
- **+1,000,000 ai_credits** upserted into `public.ai_credits.credits_remaining`
- Idempotency: `challenge_pro_subscribers.top_last_grant_period` stores the `current_period_start` ISO string; grant only fires when the incoming period is newer.

## Feed pinning
- Eco & Healthy submit handlers detect an active TOP tier and set `boosted_until` on the submission to end-of-day UTC.
- Existing feed queries already order by `boosted_until DESC`, so TOP submissions naturally rise to the top.

## AI Credits Policy exception
This is an APPROVED automatic ai_credits grant source (user-approved 2026-07-05). Add it to the approved list in `mem/features/ai-credits-policy.md` when reconciling.

## Frontend
- `useChallengePro()` returns `{ tier, isPro, isTop, activeUntil, subscribe }`. `subscribe(target)` where `target` = `'pro'` | `'top'`.
- `useChallengeProSet(userIds)` returns a Set-like object with `.tierOf(id)` for badge rendering.
- `ChallengeProBadge` supports `tier="pro"` (gold leaf) and `tier="top"` (pink/purple crown).
- `ChallengeProUpsell` shows a two-column PRO vs TOP card to non-subscribers, an "Upgrade to TOP" CTA to PRO subscribers, and a manage/cancel button to all subscribers.
