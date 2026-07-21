---
name: InfluKing PPV posts
description: Pay-per-view posts backend — tables, RLS, Stripe checkout + verify edge functions, 85/15 split
type: feature
---
# PPV posts

## Tables
- `influking_ppv_posts` — creator's paid content (title, preview_url, content_url, price_cents, is_active, counters).
- `influking_ppv_unlocks` — ownership record per purchase (buyer, amount, 85% creator / 15% platform, stripe_session_id, status pending→completed→refunded).

## RLS
- Active posts publicly readable; inactive only owner.
- Unlocks: buyer + creator can view; buyer inserts own.
- `has_ppv_unlock(post_id, user_id)` SECURITY DEFINER helper for content gating.

## Edge functions
- `ppv-checkout` — validates post, blocks self-buy + duplicate unlock, creates Stripe Checkout Session (price_data, currency from post), pre-records pending unlock with split.
- `ppv-verify` — retrieves session, flips unlock to `completed`, records PI id. Trigger `ppv_apply_unlock_counters` bumps `total_unlocks` + `total_revenue_cents`.

## Frontend hooks
`src/hooks/usePPV.ts`:
- `usePPVCheckout().buy(postId)` — invokes ppv-checkout, redirects to Stripe.
- `usePPVUnlockStatus(postId)` — boolean gate.

Verify hook: reuse `useOneOffPaymentVerify({ fn: 'ppv-verify' })` on the post detail page (success_url returns `?session_id=`).

Split matches Creator Subscriptions rule (85/15).
