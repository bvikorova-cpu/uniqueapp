---
name: Admin Stripe Refund Flow
description: Universal refund system. admin-refund-payment edge fn + RefundButton + /admin/refunds page. Operates on payment_records ledger.
type: feature
---

## Edge function: `admin-refund-payment`

Body: `{ paymentRecordId, amountCents?, reason?, adminNotes? }`

Flow:
1. Verify caller is admin via `has_role` RPC.
2. Load `payment_records` row by id. Reject if already refunded or no `stripe_payment_intent_id`.
3. `stripe.refunds.create({ payment_intent, amount?, reason })` — partial refund if `amountCents` set, else full.
4. Update row → `status='refunded'`, `refunded_at`, `refund_amount_cents`, `stripe_refund_id`, `refund_reason`, `refunded_by`.
5. Insert audit row (`action: 'payment_refunded'`).

Reasons accepted: `requested_by_customer` (default) | `duplicate` | `fraudulent`.

## Schema additions on `payment_records`

`refunded_at`, `refund_amount_cents`, `refund_reason`, `stripe_refund_id`, `refunded_by` (uuid).
Indexes on `refunded_at` and `status`.

## Frontend

- Hook: `useAdminRefund()` → `{ refund({paymentRecordId, amountCents?, reason?, adminNotes?}), loading }`
- Component: `<RefundButton paymentRecordId amount allowPartial onRefunded />` — confirm dialog with reason select + optional partial amount + notes.
- Admin page: `/admin/refunds` (`AdminRefunds.tsx`) — paginated list of last 200 payments, search by product/user/PI, refund button on paid rows with PI.

## Universal ledger

All checkout edge functions write to `payment_records` (`stripe_payment_intent_id`, `amount_cents`, `product_type`, `product_id`, `user_id`). This is the single source of truth for refunds — no need for per-product refund logic.
