-- Web Vitals real-user telemetry
-- Stores LCP/CLS/INP/FCP/TTFB samples sent from the browser.
-- Writes are public (anon) so unauthenticated visitors are counted too;
-- reads are admin-only via RLS.

CREATE TABLE IF NOT EXISTS public.vitals_log (
  id           bigserial PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  user_id      uuid NULL,                       -- nullable: anon visitors
  session_id   text NULL,
  metric       text NOT NULL,                   -- LCP|CLS|INP|FCP|TTFB
  value        double precision NOT NULL,
  rating       text NULL,                       -- good|needs-improvement|poor
  navigation_type text NULL,
  route        text NULL,
  device       text NULL,                       -- mobile|tablet|desktop
  connection   text NULL,                       -- 4g|3g|slow-2g|...
  user_agent   text NULL
);

CREATE INDEX IF NOT EXISTS vitals_log_created_idx ON public.vitals_log (created_at DESC);
CREATE INDEX IF NOT EXISTS vitals_log_metric_idx  ON public.vitals_log (metric, created_at DESC);
CREATE INDEX IF NOT EXISTS vitals_log_route_idx   ON public.vitals_log (route, created_at DESC);

ALTER TABLE public.vitals_log ENABLE ROW LEVEL SECURITY;

-- No client may read this table directly. Aggregation runs via SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "vitals_log_admin_select" ON public.vitals_log;
CREATE POLICY "vitals_log_admin_select"
  ON public.vitals_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Inserts only via the edge function (service_role). Block direct writes.
-- (No INSERT policy → RLS denies anon/authenticated inserts; service_role bypasses RLS.)

-- Aggregation RPC: per-metric p50/p75/p95 + count over last N days, optional route filter.
CREATE OR REPLACE FUNCTION public.get_vitals_summary(p_days int DEFAULT 7, p_route text DEFAULT NULL)
RETURNS TABLE (
  metric  text,
  samples bigint,
  p50     double precision,
  p75     double precision,
  p95     double precision,
  good_pct double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.metric,
    count(*)::bigint AS samples,
    percentile_cont(0.50) WITHIN GROUP (ORDER BY v.value)::double precision AS p50,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY v.value)::double precision AS p75,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY v.value)::double precision AS p95,
    (100.0 * count(*) FILTER (WHERE v.rating = 'good') / NULLIF(count(*), 0))::double precision AS good_pct
  FROM public.vitals_log v
  WHERE v.created_at >= now() - make_interval(days => greatest(p_days, 1))
    AND (p_route IS NULL OR v.route = p_route)
    AND public.has_role(auth.uid(), 'admin')   -- enforce admin even though SECURITY DEFINER
  GROUP BY v.metric
  ORDER BY v.metric;
$$;

REVOKE EXECUTE ON FUNCTION public.get_vitals_summary(int, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_vitals_summary(int, text) TO authenticated;

-- Daily p75 series for charts
CREATE OR REPLACE FUNCTION public.get_vitals_daily(p_days int DEFAULT 30, p_metric text DEFAULT 'LCP')
RETURNS TABLE (
  day  date,
  p75  double precision,
  samples bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (v.created_at AT TIME ZONE 'UTC')::date AS day,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY v.value)::double precision AS p75,
    count(*)::bigint AS samples
  FROM public.vitals_log v
  WHERE v.created_at >= now() - make_interval(days => greatest(p_days, 1))
    AND v.metric = p_metric
    AND public.has_role(auth.uid(), 'admin')
  GROUP BY 1
  ORDER BY 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_vitals_daily(int, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_vitals_daily(int, text) TO authenticated;