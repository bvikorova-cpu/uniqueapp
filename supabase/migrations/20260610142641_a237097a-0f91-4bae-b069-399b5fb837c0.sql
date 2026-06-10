
SELECT cron.unschedule('mt-escrow-auto-release') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mt-escrow-auto-release');
SELECT cron.unschedule('mt-stories-cleanup') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mt-stories-cleanup');

SELECT cron.schedule(
  'mt-escrow-auto-release',
  '15 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/mt-router',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := jsonb_build_object('action', 'escrow_auto_release', 'triggered_at', now())
  );
  $$
);

SELECT cron.schedule(
  'mt-stories-cleanup',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/mt-router',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := jsonb_build_object('action', 'stories_cleanup', 'triggered_at', now())
  );
  $$
);
