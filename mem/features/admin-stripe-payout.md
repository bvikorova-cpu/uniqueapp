---
name: Admin Stripe Connect Payout
description: How admins pay creator withdrawal requests via Stripe Connect transfers. One edge function, one button, all 7 withdrawal types.
type: feature
---

## Edge function: `admin-payout-withdrawal`

Universal admin payout for any creator withdrawal type. Body:
`{ kind, withdrawalId, action: 'approve'|'reject', adminNotes? }`

`kind` → table mapping (and the column that stores Stripe transfer ID):

| kind         | table                              | creator FK col   | transfer col          |
| ------------ | ---------------------------------- | ---------------- | --------------------- |
| instructor   | instructor_withdrawal_requests     | instructor_id    | stripe_transfer_id    |
| musician     | musician_withdrawal_requests       | musician_id      | stripe_transfer_id    |
| masterchef   | masterchef_withdrawal_requests     | chef_id          | stripe_transfer_id    |
| influencer   | influencer_withdrawal_requests     | influencer_id    | stripe_transfer_id    |
| auction      | auction_withdrawal_requests        | seller_id        | stripe_payout_id      |
| referral     | referral_withdrawal_requests       | referrer_id      | stripe_transfer_id    |
| campaign     | withdrawal_requests                | user_id          | stripe_transfer_id    |

Flow on `approve`:
1. Verify caller has `admin` role via `has_role` RPC.
2. Load withdrawal row, fetch creator's `profiles.stripe_connect_account_id` and `stripe_connect_payouts_enabled`.
3. Reject if no Connect account or payouts disabled.
4. `stripe.transfers.create({ amount, currency: 'eur', destination })`.
5. Update row → `status='completed'`, `processed_at`, transfer ID column, `processed_by` (if column exists).
6. Insert audit row in `admin_audit_log` (`action: 'withdrawal_paid'`).

`reject` just updates the row + audits (`withdrawal_rejected`).

## Frontend

- Hook: `useAdminPayoutWithdrawal()` → `{ run({kind, withdrawalId, action, adminNotes}), loading }`
- Button: `<StripePayoutButton kind amount withdrawalId onPaid />` shows confirm dialog + notes textarea then calls hook.
- Wired into all 6 admin panels (instructor, musician, masterchef, influencer, auction, referral, campaign) — sits next to the legacy "Approve only" / "Reject" buttons. Legacy approve flow kept as fallback for non-Stripe payments.
