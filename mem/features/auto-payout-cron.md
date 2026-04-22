---
name: Auto-payout cron
description: Weekly scheduled edge function that pays small pending creator withdrawals automatically via Stripe Connect.
type: feature
---

## Edge function: `auto-payout-pending-withdrawals`

Sweeps every withdrawal table for `status='pending'` rows ≤ €200 (configurable via `AUTO_PAYOUT_MAX_EUR` env), confirms creator has `stripe_connect_payouts_enabled`, then `transfers.create` and marks row `completed` with `admin_notes='Auto-paid by scheduled job'`. Logs each payout in `admin_audit_log` as `withdrawal_auto_paid` (admin_id = zero UUID for cron-attributed actions).

Bigger amounts stay pending → manual admin review via `StripePayoutButton`.

## Scheduling

User must run this SQL (in Supabase SQL editor) once to schedule weekly Monday 09:00 UTC sweep:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'auto-payout-weekly',
  '0 9 * * 1',
  $$
  select net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/auto-payout-pending-withdrawals',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Manual trigger

Admin dashboard `PendingPayoutsCard` widget shows pending count + total + a "Run auto-payout sweep" button that invokes the same edge function on demand.
