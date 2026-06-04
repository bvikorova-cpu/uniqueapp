---
name: Megatalent Subscription Revenue Split
description: Per-subscription split for Premium €10 and TOP Premium €15 — €5 to referrer, rest to platform. No prize-pool funding from subs.
type: feature
---

## Split per subscription (per billing cycle, recurring)

| Tier | Price | With referral code | Without referral code |
|------|-------|--------------------|-----------------------|
| Premium | €10 | €5 referrer + €5 platform | €10 platform |
| TOP Premium | €15 | €5 referrer + €10 platform | €15 platform |

- Referral reward is **flat €5** per paid invoice (no tier multipliers, no 80/20 split for these subscriptions).
- Triggered in `stripe-webhook` on `invoice.payment_succeeded` (recurring) — only if `referral_attributions` exists and is approved.
- The remainder ALWAYS goes to the platform. **None of the subscription revenue funds the contest prize pool.**

## Contest prize pool

- Prize pool is **NOT derived from subscriptions**. It is a fixed quarterly amount set in `mt_contest_settings`.
- See `mem://features/megatalent-contest-periods` for period schedule.

## Notes

- The historical "80/20 split" rule applies only to **Brand Collaboration escrow** and **Megatalent tips/gifts**, NOT to Megatalent subscription revenue.
- Webhook reference: `supabase/functions/stripe-webhook/index.ts` — `invoice.payment_succeeded` branch.
