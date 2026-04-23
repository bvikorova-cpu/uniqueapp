
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule existing job if present (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('weekly-xp-snapshot');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'weekly-xp-snapshot',
  '5 0 * * 1', -- every Monday at 00:05 UTC
  $$ SELECT public.snapshot_weekly_xp_winners(); $$
);
