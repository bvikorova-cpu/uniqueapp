---
name: SCA / 3DS handling
description: Detects Stripe invoices in requires_action state and surfaces 3-D Secure confirmation flow to subscribers + admin dashboard.
type: feature
---
- Table: `sca_pending_actions` (RLS: user views own by email/user_id; admins view all).
- Edge fns:
  - `check-sca` — auth required; lists open Stripe invoices for customer, finds payment_intent.status=`requires_action`, upserts row, returns `hosted_invoice_url` + `next_action_url`. Marks resolved rows `confirmed` when no pending found.
  - `sca-confirm-url` — auth required; validates invoice ownership via customer email and returns hosted/next-action URL to open.
  - `admin-sca` — admin-gated; 90d KPIs (pending, confirmed, abandoned, at-risk EUR, success rate) + recent rows. Logs to `admin_audit_log`.
- UI:
  - `<SCABanner>` mounted in `App.tsx` next to `<DunningBanner>`. Amber styling; 2h snooze via `localStorage.sca_dismissed_until`. Opens hosted invoice in new tab.
  - `/admin/sca` (AdminSCA.tsx) — KPI tiles + table of pending/confirmed/abandoned challenges.
- Stripe API: `2025-08-27.basil`. Uses `invoices.list({ status:'open', expand:['data.payment_intent'] })`.
