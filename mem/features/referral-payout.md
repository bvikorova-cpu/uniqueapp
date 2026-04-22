---
name: Referral Payout Automation
description: How €5 referral rewards get auto-credited when a referred friend's first subscription activates. Phase 9h.
type: feature
---

## Flow

1. **Capture** — Visitor lands on `/auth?ref=UNIQ-XXXXXX` (or any page with `?ref=`). `useReferralCapture` (mounted globally inside `AuthProvider` via `<ReferralCaptureMount />`) stores the code in `localStorage` under `pending_referral_code`.

2. **Claim** — As soon as the user is authenticated, the same hook calls edge fn **`claim-referral`** with the stored code. The function:
   - Resolves the code → `referrer_id` via `megatalent_referral_codes` first, then falls back to the deterministic `UNIQ-{first6chars-of-uuid}` format used by `ReferralCard.tsx`.
   - Inserts a row into **`referral_attributions`** (`referrer_id`, `referred_user_id`, `code`).
   - The table has `UNIQUE (referred_user_id)` so the attribution is one-shot per user.
   - Marks `referral_claimed_{userId}=1` in localStorage to never re-call.

3. **Reward** — `stripe-webhook` listens for `customer.subscription.created` / `customer.subscription.updated` (active|trialing). It:
   - Maps Stripe customer email → `profiles.id`.
   - Looks up the buyer in `referral_attributions`. If found AND `rewarded_at IS NULL`:
     - Inserts `megatalent_referral_earnings` row: `amount=5`, `paid=false`, `auto_credited=true`, `source_subscription_id=sub.id`.
     - A unique index `(referrer_id, source_subscription_id) WHERE source_subscription_id IS NOT NULL` guarantees one-shot credit per subscription.
     - Updates `referral_attributions.rewarded_at` and `first_subscription_id`.
     - Inserts `admin_audit_log` row `referral_reward_credited`.

4. **Payout** — The €5 sits in `megatalent_referral_earnings` until the referrer requests it via the existing `referral_withdrawal_requests` flow, which is paid by either:
   - manual admin via `StripePayoutButton` (`kind: 'referral'`), or
   - the `auto-payout-pending-withdrawals` weekly cron (≤ €200).

## Files
- `supabase/migrations/...` — `referral_attributions` table + `auto_credited`/`source_subscription_id` columns + unique index.
- `supabase/functions/claim-referral/index.ts`
- `supabase/functions/stripe-webhook/index.ts` — `customer.subscription.created/updated` branch.
- `src/hooks/useReferralCapture.ts` + `src/components/referral/ReferralCaptureMount.tsx` (mounted in `App.tsx` inside `AuthProvider`).

## Why webhook (not frontend verify)
Subscription activation can happen from Stripe Portal (upgrades, reactivations) or from a recovered failed payment — none of which round-trip through our `verify-subscription` call. Webhook is the only reliable trigger.
