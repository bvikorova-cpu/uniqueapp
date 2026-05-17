
ALTER TABLE public.campaign_donations
  ADD COLUMN IF NOT EXISTS past_due_since timestamptz,
  ADD COLUMN IF NOT EXISTS dunning_notifications_sent int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_dunning_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_campaign_donations_past_due
  ON public.campaign_donations (past_due_since)
  WHERE subscription_status = 'past_due';

-- Enable pg_cron + pg_net (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the dunning cron daily at 09:00 UTC
DO $$
DECLARE
  proj_url text := 'https://jufrdzeonywluwutvyxz.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q';
BEGIN
  PERFORM cron.unschedule('fundraising-dunning-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fundraising-dunning-daily');

  PERFORM cron.schedule(
    'fundraising-dunning-daily',
    '0 9 * * *',
    format($job$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer %s'),
        body := '{}'::jsonb
      );
    $job$, proj_url || '/functions/v1/fundraising-dunning-cron', anon_key)
  );
END $$;
