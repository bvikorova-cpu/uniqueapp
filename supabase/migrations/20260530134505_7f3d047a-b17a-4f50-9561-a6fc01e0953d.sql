CREATE TABLE IF NOT EXISTS public.health_check_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  ok boolean NOT NULL,
  status_code integer,
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  alerted boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'cron'
);

CREATE INDEX IF NOT EXISTS idx_health_check_log_created
  ON public.health_check_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_check_log_ok_created
  ON public.health_check_log (ok, created_at DESC);

GRANT SELECT, INSERT ON public.health_check_log TO authenticated;
GRANT ALL ON public.health_check_log TO service_role;

ALTER TABLE public.health_check_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view health log"
  ON public.health_check_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role writes health log"
  ON public.health_check_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Schedule health-monitor cron every 5 minutes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    BEGIN
      PERFORM cron.unschedule('health-monitor-5min');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    PERFORM cron.schedule(
      'health-monitor-5min',
      '*/5 * * * *',
      $cron$
        SELECT net.http_post(
          url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/health-monitor',
          headers := jsonb_build_object('Content-Type','application/json'),
          body    := jsonb_build_object('source','cron')
        );
      $cron$
    );
  END IF;
END $$;