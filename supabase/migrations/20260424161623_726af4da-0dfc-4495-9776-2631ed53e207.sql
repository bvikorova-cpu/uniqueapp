-- 1. Snapshot table
CREATE TABLE IF NOT EXISTS public.security_scan_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type text NOT NULL CHECK (scan_type IN ('edge_functions','frontend_deps')),
  triggered_by uuid,
  trigger_source text NOT NULL DEFAULT 'manual' CHECK (trigger_source IN ('manual','cron')),
  total_findings integer NOT NULL DEFAULT 0,
  critical_count integer NOT NULL DEFAULT 0,
  high_count integer NOT NULL DEFAULT 0,
  medium_count integer NOT NULL DEFAULT 0,
  low_count integer NOT NULL DEFAULT 0,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sec_scan_type_created
  ON public.security_scan_snapshots (scan_type, created_at DESC);

ALTER TABLE public.security_scan_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security scans"
  ON public.security_scan_snapshots
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert security scans"
  ON public.security_scan_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Daily cron — invokes both scans via pg_net at 03:30 UTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN

    PERFORM cron.unschedule('daily-security-scan-edge');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignore if job didn't exist
  NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN

    PERFORM cron.unschedule('daily-security-scan-deps');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN

    PERFORM cron.schedule(
      'daily-security-scan-edge',
      '30 3 * * *',
      $cron$
        SELECT net.http_post(
          url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/security-scan-edge-functions',
          headers := jsonb_build_object('Content-Type','application/json'),
          body    := jsonb_build_object('source','cron')
        );
      $cron$
    );

    PERFORM cron.schedule(
      'daily-security-scan-deps',
      '35 3 * * *',
      $cron$
        SELECT net.http_post(
          url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/security-scan-frontend-deps',
          headers := jsonb_build_object('Content-Type','application/json'),
          body    := jsonb_build_object('source','cron')
        );
      $cron$
    );
  END IF;
END $$;