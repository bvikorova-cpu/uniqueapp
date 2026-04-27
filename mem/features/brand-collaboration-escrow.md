---
name: Brand Collaboration Escrow
description: Brand pays via Stripe → funds held in campaign_escrow → brand marks completed → 80% released to influencer_earnings, 20% platform fee.
type: feature
---

## Flow

1. Creator applies (`campaign_applications`, status=`pending`).
2. Brand opens `/brand-dashboard` → tab "Applications & Escrow" → `Approve & Pay` opens dialog with agreed EUR amount.
3. Frontend calls edge fn `brand-campaign-checkout` → returns Stripe checkout URL → opens in new tab.
4. Edge fn pre-creates `campaign_escrow` row with status=`awaiting_payment` and updates application to `approved` + `payment_status=pending`.
5. Stripe webhook (`stripe-webhook`) on `checkout.session.completed` with metadata `type=brand_campaign_escrow` flips escrow → `held` and notifies influencer.
6. Brand returns and clicks `Mark Completed` → calls `brand-release-escrow` → inserts `influencer_earnings` row (source=`brand_campaign`), bumps `influencer_balances.total_earned`, marks escrow=`released`, application `payment_status=released`. Notifications go to both parties.

## Split

- 20% platform fee, 80% creator (`PLATFORM_FEE_PCT = 0.20`).

## UI

- `src/components/brand/BrandApplicationsManager.tsx` — list of applications + escrow badges (Awaiting payment / Escrow held / Released) + Approve & Pay / Reject / Mark Completed buttons.
- Influencer side: `InfluencerEarningsPage` already lists rows from `influencer_earnings` so `brand_campaign` source appears automatically.

## Tables

- `campaign_escrow` (status: `awaiting_payment | held | released | refunded | disputed`, amount_cents/platform_fee_cents/net_cents, application_id FK)
- `campaign_applications.payment_status` ∈ `pending | paid | released | refunded`

## Edge functions

- `brand-campaign-checkout` (verify_jwt=true) — brand owner only, validates 1≤agreedEur≤100k.
- `brand-release-escrow` (verify_jwt=true) — brand owner OR admin, only when status=`held`.
- `stripe-webhook` (verify_jwt=false) — handles checkout.session.completed metadata.type=`brand_campaign_escrow`.
