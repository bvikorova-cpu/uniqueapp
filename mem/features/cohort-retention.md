---
name: Subscription Cohort Retention
description: Admin /admin/cohort-retention heatmap of monthly subscriber cohorts pulled live from Stripe. Phase 9l.
type: feature
---

## Edge function: `admin-cohort-retention`

Admin-only (`has_role` gate). No DB writes besides audit row.

- Pages `subscriptions.list({ status: 'all', created.gte: 12mo })` up to 3000.
- Buckets each sub by signup month (`created`) → cohort key `YYYY-MM`.
- For each sub, `lived_months = monthDiff(created, canceled_at ?? now)` clamped to cohort age.
- Increments `retained[0..lived_months]` for that cohort.
- Returns `cohorts[].cells[i] = { count, pct }` truncated to the cohort's actual age (no future cells).
- Audit-logs `cohort_retention_viewed`.

## Frontend

`/admin/cohort-retention` — heatmap table. Columns: Cohort, Size, M0..M11. Cell background uses `hsl(var(--primary) / α)` with α scaled by retention %. Empty future cells render as `—`.
