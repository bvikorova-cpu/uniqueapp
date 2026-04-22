---
name: Win-Back Campaigns
description: Auto-creates discount offer when subscription cancelled. Public claim page + admin dashboard. Phase 9n.
type: feature
---

## Lifecycle

1. Stripe → `customer.subscription.deleted` → `stripe-webhook` inserts `winback_campaigns` row (status `sent`, default 50% off × 3 months, expires 14d).
2. Admin shares offer link `/winback/{offer_token}` (copy from `/admin/winback`).
3. User opens link → `winback-get-offer` returns masked email + offer terms.
4. User clicks "Claim" → `winback-claim` lazily creates a Stripe coupon + Checkout Session (subscription mode) with `discounts: [{coupon}]` and metadata `winback_campaign_id`.
5. After payment → `customer.subscription.created` webhook detects metadata → flips campaign to `claimed`.

## Pieces

- **Table** `winback_campaigns` (RLS: user sees own; admin all).
- **Edge fns**:
  - `winback-get-offer` (public) — masked offer info by token.
  - `winback-claim` (public) — creates Stripe coupon + checkout session.
  - `admin-winback` — admin list/KPIs (90d sent/claimed/claim_rate) + manual create.
- **Frontend**:
  - `/winback/:token` (`WinBackOffer.tsx`) — cinematic public landing with Heart hero, gradient CTA, expiry countdown.
  - `/admin/winback` (`AdminWinBack.tsx`) — KPI tiles + searchable table with copy-link & open-link actions.

## Notes

- `DEFAULT_PRICE_ID` in `WinBackOffer.tsx` must match a real Stripe subscription price for this project (currently `price_megatalent_monthly` — adjust as needed).
- Coupon is `duration: repeating, duration_in_months`, generated lazily on first claim.
- Webhook is idempotent — won't duplicate campaign for same `stripe_subscription_id`.
