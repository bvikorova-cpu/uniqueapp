---
name: Subscription Analytics
description: Admin dashboard with MRR, ARR, ARPU, LTV, churn and 12-month revenue trend pulled live from Stripe. Phase 9k.
type: feature
---

## Edge function: `admin-subscription-analytics`

Admin-only (`has_role` gate). Pulls data live from Stripe — no caching, no DB writes (except audit).

**Aggregates:**
- Lists all subs (`status='all'`, page until 1000) → buckets by status (`active`, `trialing`, `past_due`, `canceled`, plus `cancel_at_period_end` count).
- Computes per-sub MRR by normalizing every `subscription.items[].price` to monthly (day → ×30, week → ×4.345, month, year → ÷12) × quantity.
- **MRR** = sum across `active` + `past_due`. **ARR** = MRR × 12.
- **ARPU** = MRR / active. **LTV** = ARPU / (churn_rate); falls back to ARPU × 24 when churn is zero.
- **30-day churn** = (subs canceled in last 30d) / (active + canceled in last 30d) × 100.

**12-month revenue trend:** pages `invoices.list({ status: 'paid', created.gte: 12mo })` up to 2000, buckets by month using `status_transitions.paid_at`, returns `[{ month: 'YYYY-MM', revenue, invoices }]`.

Returns aggregated numbers only — no PII. Audit-logs `subscription_analytics_viewed`.

## Frontend

`/admin/subscription-analytics` (admin-only) — 10 KPI tiles + Recharts area chart for 12mo revenue. Currency-aware via `useCurrency().format()`. Refresh button re-runs the function. Auto-loads on mount.
