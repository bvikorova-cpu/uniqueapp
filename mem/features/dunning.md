---
name: Dunning / Failed Payment Recovery
description: Tracks failed subscription invoices via stripe-webhook, banners user to update card, admin sees /admin/dunning dashboard. Phase 9m.
type: feature
---

## Lifecycle

1. Stripe → `invoice.payment_failed` or `invoice.payment_action_required` → `stripe-webhook` inserts a `dunning_events` row (kind = `failed` or `requires_action`).
2. User signs in → `<DunningBanner>` (mounted in App) calls `check-dunning` → if open row exists AND Stripe sub is still `past_due`/`unpaid`/`incomplete`, sticky red banner shown with **Update card** CTA.
3. CTA → `update-payment-method` edge fn → returns Stripe Billing Portal URL with `flow_data.type = payment_method_update` → user redirected to update card.
4. Stripe retries → on `invoice.payment_succeeded` webhook flips all open dunning rows for that sub → `recovered`.

## Pieces

- **Table** `dunning_events`: stripe_event_id (uniq), stripe_customer_id, stripe_subscription_id, stripe_invoice_id, user_id (→ profiles), email, amount_due_cents, currency, attempt_count, next_retry_at, hosted_invoice_url, kind, recovered_at. RLS: user sees own; admin sees + updates all; inserts only via service role (webhook).
- **Edge fns**: `check-dunning` (user), `update-payment-method` (user → portal), `admin-dunning` (admin list + 90d stats).
- **Frontend**: `<DunningBanner>` sticky top, snoozes via `localStorage` for 6h. `/admin/dunning` cinematic admin page with KPIs (total/open/recovered/recovery_rate/at_risk) + filterable table.

## Banner UX

- Currency-aware via `useCurrency()`.
- Shows attempt count + next retry date if available.
- "Update card" button uses Stripe Portal flow_data so user lands directly on card update screen.
