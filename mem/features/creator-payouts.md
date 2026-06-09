---
name: Creator Payouts (Stripe Connect)
description: Konsolidovaný payout flow pre creator earnings — Earnings.tsx + InstantPayoutButton
type: feature
---

# Creator Payouts — konsolidovaný flow

Jediná edge funkcia: **`stripe-connect-payout`**. Volajú ju `src/pages/Earnings.tsx` aj `src/components/earnings/InstantPayoutButton.tsx`.

## Garancie (server-side)
1. **Auth** — JWT povinné.
2. **Connect onboarding** — `profiles.stripe_connect_account_id` + `stripe_connect_payouts_enabled`.
3. **Race guard** — odmietne `409 PAYOUT_IN_FLIGHT` ak existuje iný `pending|processing` riadok v `creator_payouts` pre user_id.
4. **Balance check** — RPC `get_creator_available_cents(user)` = `SUM(seller_amount where released)*100 − SUM(amount+fee of pending/processing/paid creator_payouts)`. Odmietne `400 INSUFFICIENT_BALANCE`.
5. **Audit log** — `public.creator_payouts` (pending → processing → paid/failed).

## Limity & fees
- **Standard**: min €1, fee 0 %.
- **Instant**: min €10, fee **1 %** (`INSTANT_FEE_BPS=100`), počíta sa serverovo. Klient posiela GROSS amount.

## Tabuľka `creator_payouts`
`user_id, amount_cents, fee_cents, currency, method('standard'|'instant'), status('pending'|'processing'|'paid'|'failed'|'canceled'), stripe_payout_id, stripe_connect_account_id, error_message`. RLS: user vidí svoje, admin všetky.

## Rozdiel oproti Fundraising
- Fundraising = `request-campaign-payout` → admin review queue (`campaign_payouts`), transfer z platform balance.
- Creator earnings = `stripe-connect-payout` → priamy `stripe.payouts.create` na connected account (peniaze tam už sú cez Stripe Connect Direct Transfers).
