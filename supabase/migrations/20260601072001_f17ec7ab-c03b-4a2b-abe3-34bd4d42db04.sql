SELECT cron.schedule(
  'monthly-credits-grant',
  '0 2 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/monthly-credits-grant',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := jsonb_build_object('time', now())
  );
  $$
);