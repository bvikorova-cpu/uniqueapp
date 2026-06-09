---
name: Campaign Payouts (Stripe Connect)
description: Per-category platform fees, Connect onboarding, and Direct-Transfer donation flow for Fundraising
type: feature
---

# Fundraising — Stripe Connect & Per-Category Fees

## Onboarding
- Campaign owners onboard via `stripe-connect-onboarding` from `CampaignDashboard` ("Connect Stripe account").
- `stripe-connect-status` syncs `profiles.stripe_connect_account_id`, `stripe_connect_charges_enabled`, `stripe_connect_payouts_enabled`, `stripe_connect_onboarding_complete`.

## Per-category platform fees (applied 2 places — keep in sync)
| Type    | Fee  |
|---------|------|
| medical | 6%   |
| dream   | 7%   |
| hero    | 5%   |
| pet     | 6%   |
| student | 5%   |
| crisis  | 8%   |
| talent  | 10%  |

1. **`create-checkout` `campaign_donation` branch** — when campaign owner has Connect with `charges_enabled`, adds:
   - One-off: `payment_intent_data.application_fee_amount = amount_cents * pct` + `payment_intent_data.transfer_data.destination = connect_account_id`
   - Monthly: `subscription_data.application_fee_percent = pct*100` + `subscription_data.transfer_data.destination`
   - Falls back to platform-balance capture if owner not onboarded (admin payout path via `request-campaign-payout`).
2. **`process_campaign_donation` RPC** — records the same `platform_fee` / `net_amount` on `campaign_donations`.

## Payouts
- Owners request withdrawal via `request-campaign-payout` (admin-review queue).
- Race guard: `request-campaign-payout` rejects with `409 PAYOUT_IN_FLIGHT` if another `pending|pending_review|processing` payout exists for the campaign.
- Legacy `stripe-connect-payout` is still used by `/earnings` (creator earnings), NOT by Fundraising.
