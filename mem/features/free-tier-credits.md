---
name: Free Tier Credits
description: 10 free credits at signup + 10 each 1st of month (Europe/Bratislava). Paid plans on top.
type: feature
---
# Free Tier Credits

- **Signup grant**: 10 credits via `handle_new_user_free_credits` trigger.
- **Monthly top-up**: +10 credits on 1st of each month (Europe/Bratislava TZ) via `ensure_free_tier_credits` RPC. Idempotent per `month_key` (YYYY-MM).
- **Settings**: `free_tier_settings` (id=1, enabled, monthly_amount, timezone).
- **Tables**: `free_tier_credits` (balance/month_key/welcome_shown), `free_tier_credit_ledger` (audit).
- **Consume**: `consume_free_tier_credits(_amount, _reason)` RPC.
- **Hook**: `useFreeTierCredits` calls `ensure_free_tier_credits` on mount → auto-grants if month rolled over.

Core "100% paid-only" rule is INACCURATE — free tier exists alongside paid AI credits.
