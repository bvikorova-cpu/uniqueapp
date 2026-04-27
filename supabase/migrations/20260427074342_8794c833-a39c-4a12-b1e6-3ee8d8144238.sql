
-- Make sure extensions exist
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old job if rerunning
SELECT cron.unschedule('daily-stripe-reconciliation')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-stripe-reconciliation');

SELECT cron.schedule(
  'daily-stripe-reconciliation',
  '15 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/admin-reconcile-payments',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  ) AS request_id;
  $$
);
