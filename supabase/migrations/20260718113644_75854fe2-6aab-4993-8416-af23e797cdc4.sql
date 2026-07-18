
-- TTL cleanup for WebRTC signaling payloads
CREATE OR REPLACE FUNCTION public.cleanup_old_call_signals()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.call_signals WHERE created_at < now() - INTERVAL '1 hour';
$$;

-- Enable pg_cron if not already
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule any existing job with the same name to keep migration idempotent
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-call-signals-hourly');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'cleanup-call-signals-hourly',
  '15 * * * *',
  $$SELECT public.cleanup_old_call_signals();$$
);
