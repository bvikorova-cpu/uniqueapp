create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('best-friend-daily-checkin') where exists (select 1 from cron.job where jobname='best-friend-daily-checkin');

select cron.schedule(
  'best-friend-daily-checkin',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/best-friend-daily-checkin',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
    body := jsonb_build_object('time', now())
  );
  $$
);