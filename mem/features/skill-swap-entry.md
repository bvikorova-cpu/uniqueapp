---
name: Skill Swap €1/month subscription
description: One euro per month Stripe subscription for Skill Swap access. No commission on swaps.
type: feature
---
# Skill Swap monetization

- **Model**: €1/month Stripe subscription. Cancel anytime. 0% commission on swaps.
- **Product key**: `skill_swap` in `create-checkout` → mode: `subscription`, amount: 100 cents, interval: `month`.
- **Access check**: `check-subscription` with `tier: "skill_swap"` uses the generic Stripe subscriptions path (no DB special-case).
- **Frontend hook**: `useSkillSwap` reads `subscribed`/`subscription_end` from `check-subscription` (via proxy `check-skill-swap-subscription`).
- **Success URL**: `/skill-swap?subscribed=true&session_id={CHECKOUT_SESSION_ID}` — page shows a toast and refreshes membership state.
- **Legacy**: The `skill_swap_members` table + `verify-skill-swap-entry` function are unused for new signups (kept only for historic lifetime members). Do not reintroduce lifetime pricing.
- **UI copy**: "€1/month • Cancel anytime • 0% commission on swaps".
