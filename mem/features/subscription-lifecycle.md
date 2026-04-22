---
name: Subscription lifecycle
description: User-facing /account/subscriptions page + edge fns (list/pause/resume/cancel-by-id) for self-serve plan management.
type: feature
---
**Edge functions**:
- `list-user-subscriptions` (GET via invoke) — returns ALL Stripe subs for logged-in user (active/trialing/past_due/canceled), incl. `cancel_at_period_end`, `current_period_end`, product, amount, currency, interval.
- `pause-subscription` (`{months}`, default 1) — `pause_collection: { behavior: 'void', resumes_at }`.
- `resume-subscription` (`{subscription_id}`) — clears both `pause_collection` AND `cancel_at_period_end`.
- `cancel-subscription-by-id` (`{subscription_id, immediate?: boolean}`) — sets `cancel_at_period_end: true` (or immediate cancel). Validates that the subscription's customer email matches the auth user.
- `customer-portal` — Stripe-hosted portal for upgrades/downgrades/payment method updates.

**UI**: `/account/subscriptions` (`MySubscriptions.tsx`).
- Lists every sub as a card with status badge, renew/end date, amount.
- Buttons: **Pause 1 month**, **Cancel** (with confirm dialog), **Resume** (when scheduled to cancel or paused), **Update payment method** (past_due → portal), **Stripe Portal** (top-right) for full self-serve.

**Important**: Upgrades/downgrades go through Stripe Customer Portal (no custom price-switching UI to keep prorations clean).
