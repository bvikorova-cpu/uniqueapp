---
name: Payment reconciliation
description: Daily Stripe vs payment_records ledger comparison. Edge function admin-reconcile-payments + /admin/reconciliation UI.
type: feature
---
**Edge function**: `admin-reconcile-payments` (POST `{date?: 'YYYY-MM-DD'}`, default = yesterday UTC).
- Pages all `stripe.charges.list` for the day, joins by payment_intent.
- Returns counts + arrays for: missing_in_db, missing_in_stripe, amount_mismatch, status_mismatch.
- Status mapping: `refunded` → refunded, `disputed` → disputed, `succeeded` → paid.
- Logs every run to `admin_audit_log` (`reconcile_run`).

**UI**: `/admin/reconciliation` (admin-only). Date picker + Run button + 6 KPI cards + tabbed mismatch lists with deep links to Stripe dashboard.
