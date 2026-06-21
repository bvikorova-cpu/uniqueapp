
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm
  ON public.profiles USING gin (full_name extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON public.messages (sender_id);

CREATE OR REPLACE FUNCTION public.cleanup_log_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.vitals_log WHERE created_at < now() - interval '7 days';
  DELETE FROM public.health_check_log WHERE created_at < now() - interval '3 days';
  DELETE FROM public.smoke_test_route_results WHERE created_at < now() - interval '14 days';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_log_tables() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_log_tables() FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_log_tables() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_log_tables() TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-log-tables-daily') THEN
      PERFORM cron.unschedule('cleanup-log-tables-daily');
    END IF;
    PERFORM cron.schedule(
      'cleanup-log-tables-daily',
      '15 3 * * *',
      $cron$ SELECT public.cleanup_log_tables(); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
