---
name: Stripe Disputes & Chargebacks
description: stripe_disputes table + webhook lifecycle handling + admin-submit-dispute-evidence edge fn + /admin/disputes page.
type: feature
---

## Schema: `stripe_disputes`

Mirrors Stripe disputes. Keys: `stripe_dispute_id` (unique), `stripe_payment_intent_id`, `stripe_charge_id`, `payment_record_id` (FK), `amount_cents`, `currency`, `reason`, `status`, `evidence_due_by`, `evidence` (jsonb), `evidence_submitted_at`, `is_charge_refundable`, `admin_notes`, `resolved_at`, `resolution`. Admin-only RLS; webhook writes via service role.

## Webhook (`stripe-webhook`)

Handles `charge.dispute.created|updated|closed|funds_withdrawn|funds_reinstated` → upserts row. On `created`, also flips `payment_records.status='disputed'` and writes audit log.

## Edge fn `admin-submit-dispute-evidence`

Body: `{ disputeId, evidence: {product_description, customer_communication, service_date, shipping_tracking_number, refund_policy, uncategorized_text}, submit }`. Verifies admin, calls `stripe.disputes.update()`, persists returned `evidence`/`status`, audits.

## Admin UI: `/admin/disputes` (`AdminDisputes.tsx`)

KPI cards (open/won/lost), search by dispute id / PI / reason / status, evidence dialog with all standard Stripe evidence fields + internal admin_notes, "Save draft" vs "Submit to Stripe" actions. Resolved disputes are read-only ("View" button).
