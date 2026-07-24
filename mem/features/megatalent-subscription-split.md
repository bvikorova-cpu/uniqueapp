---
name: Megatalent Subscription Revenue Split
description: Premium €10 / TOP Premium €15. €5 flat referral to inviter. 50% of platform's remainder funds the live contest prize pool.
type: feature
---

## Split per subscription (every paid invoice, recurring)

| Tier | Price | With referral code | Without referral code |
|------|-------|--------------------|-----------------------|
| Premium | €10 | €5 referrer + €5 platform | €10 platform |
| TOP Premium | €15 | €5 referrer + €10 platform | €15 platform |

- Referral reward = **flat €5** per paid invoice (no tier multipliers).
- Fired in `stripe-webhook` on `invoice.payment_succeeded` when an approved `referral_attributions` row exists.

## Prize-pool funding (NEW)

- After paying the referral, **50 %** of the platform's share is added to the current quarterly contest prize pool via `public.mt_add_platform_share(_amount_eur)`.
- The other 50 % stays with the platform.
- Configurable per period via `mt_contest_settings.revenue_share_pct` (default 50) and `min_prize_pool_eur` (default €5,000 floor).
- See `mem://features/megatalent-contest-periods` for schedule and formula.

## Notes

- Historical "80/20 split" applies only to **Brand Collaboration escrow** and **Megatalent tips/gifts**, NOT to subscription revenue.
- Webhook reference: `supabase/functions/stripe-webhook/index.ts` — `invoice.payment_succeeded` branch.
