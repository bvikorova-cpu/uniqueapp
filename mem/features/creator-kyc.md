---
name: Creator KYC Verification
description: Stripe Identity verification flow gating creator payouts above €100. Hosted document + selfie capture, admin override, GDPR-minimal data storage.
type: feature
---
- Table: `creator_kyc_verifications` (one row per user_id; RLS — user sees own, admin sees/updates all).
- Statuses: `unverified | pending | verified | rejected | requires_input`.
- Edge fns:
  - `kyc-start` — auth required; creates Stripe Identity verificationSession (`type:'document'`, allowed: passport/driving_license/id_card, requires live selfie). Reuses existing `requires_input` session. Returns hosted URL.
  - `kyc-check` — auth required; polls Stripe session, syncs status to DB. Extracts `verified_outputs` (name, dob, country, doc type) on success.
  - `admin-kyc` — admin-gated. GET → counts + rows. POST `?action=override` → manual approve/reject (logs to admin_audit_log).
- UI:
  - `/account/verification` (CreatorVerification.tsx) — status card + start button. Auto-rechecks on return via `?session=` param.
  - `/admin/kyc` (AdminKYC.tsx) — KPI tiles by status + table with override dialog.
- Threshold rule: payouts >€100 should require `status = verified`. Enforce in `admin-payout-withdrawal` if not already.
- Stripe API: `2025-08-27.basil`. Uses `stripe.identity.verificationSessions`.
- GDPR: only stores verified_name, verified_dob, verified_country, document_type — actual ID images stay with Stripe.
