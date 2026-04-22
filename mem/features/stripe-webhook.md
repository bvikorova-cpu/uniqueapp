---
name: Stripe Webhook Listener
description: Universal stripe-webhook edge fn syncs payment_records ledger with Stripe events (refunds, disputes, late payment confirmations).
type: feature
---

## Edge function: `stripe-webhook`

`verify_jwt = false` (Stripe doesn't send JWT). Signature verified via `STRIPE_WEBHOOK_SECRET`.

URL: `https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/stripe-webhook`

## Handled events

| Event | Action on `payment_records` |
| --- | --- |
| `payment_intent.succeeded` | status → `paid`, set `verified_at` |
| `checkout.session.completed` | Fallback if frontend verify never fires — links session→PI, status `paid` |
| `charge.refunded` | status → `refunded`, fills `refund_amount_cents`, `stripe_refund_id`, `refund_reason` |
| `charge.dispute.created` | status → `disputed`, audit log row `stripe_dispute_opened` |
| `transfer.created` | Logged (already recorded by `admin-payout-withdrawal`) |

Always returns 200 (even on internal errors) to stop Stripe retry loops on logic bugs. Idempotent — safe to replay.

## Setup in Stripe dashboard

1. Developers → Webhooks → Add endpoint.
2. URL: function URL above.
3. Events: select the 5 listed events.
4. Copy signing secret → already stored as `STRIPE_WEBHOOK_SECRET`.

## Why it matters

- Refund initiated from **Stripe dashboard** (not our admin button) → DB stays in sync.
- Dispute (chargeback) opened by customer → admin sees `disputed` status + audit row.
- If frontend verify-* function fails or user closes tab → webhook still confirms payment.
