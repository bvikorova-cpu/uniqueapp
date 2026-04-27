---
name: Performance indexes & Stripe reconciliation
description: All FK columns auto-indexed (375 indexes added). Daily Stripe reconciliation cron at 04:15 UTC writes to reconciliation_runs table.
type: feature
---

## Performance
- Migration ensured CREATE INDEX IF NOT EXISTS on every public-schema FK column.
- Pattern: `idx_<table>_<col>`. 0 unindexed FKs remaining.

## Stripe reconciliation
- Edge fn: `admin-reconcile-payments`. Body `{source:'cron'}` skips admin auth.
- Writes summary + details to `public.reconciliation_runs` (admin-only RLS).
- pg_cron job `daily-stripe-reconciliation` at `15 4 * * *` UTC.
- Admin UI: `/admin/reconciliation` (manual run for any date).
