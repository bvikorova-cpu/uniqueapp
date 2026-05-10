SELECT cron.schedule(
  'auto-payout-weekly',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url:='https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/auto-payout-pending-withdrawals',
    headers:='{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  );
  $$
);