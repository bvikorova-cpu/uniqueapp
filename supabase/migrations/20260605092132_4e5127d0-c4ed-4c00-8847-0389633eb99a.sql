-- Schedule daily auto-release of stale Megatalent escrow and weekly cleanup of expired stories.
-- Uses existing pg_cron + pg_net extensions.

-- Drop in case re-run
SELECT cron.unschedule('mt-escrow-auto-release') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mt-escrow-auto-release');
SELECT cron.unschedule('mt-stories-cleanup') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mt-stories-cleanup');

-- Daily at 03:15 UTC: auto-release stale paid orders/bookings
SELECT cron.schedule(
  'mt-escrow-auto-release',
  '15 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/mt-escrow-auto-release',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);

-- Daily at 04:00 UTC: purge stories expired > 7 days ago
SELECT cron.schedule(
  'mt-stories-cleanup',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/mt-stories-cleanup',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);