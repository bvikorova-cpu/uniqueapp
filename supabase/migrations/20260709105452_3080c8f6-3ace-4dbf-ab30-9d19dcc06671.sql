
CREATE TABLE IF NOT EXISTS public.edge_function_metrics (
  id BIGSERIAL PRIMARY KEY,
  function_name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  ok BOOLEAN NOT NULL,
  status_code INTEGER,
  error_message TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_efm_created_at ON public.edge_function_metrics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efm_function_created ON public.edge_function_metrics (function_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efm_ok ON public.edge_function_metrics (ok) WHERE ok = false;

GRANT INSERT ON public.edge_function_metrics TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.edge_function_metrics_id_seq TO anon, authenticated;
GRANT SELECT ON public.edge_function_metrics TO authenticated;
GRANT ALL ON public.edge_function_metrics TO service_role;

ALTER TABLE public.edge_function_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert own metric"
  ON public.edge_function_metrics FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    duration_ms >= 0
    AND duration_ms < 600000
    AND length(function_name) < 200
    AND (error_message IS NULL OR length(error_message) < 1000)
  );

CREATE POLICY "admins can read metrics"
  ON public.edge_function_metrics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Aggregated view for last 7 days, admin-readable
CREATE OR REPLACE FUNCTION public.get_edge_function_stats_7d()
RETURNS TABLE (
  function_name TEXT,
  total_calls BIGINT,
  error_count BIGINT,
  error_rate NUMERIC,
  avg_ms NUMERIC,
  p50_ms NUMERIC,
  p95_ms NUMERIC,
  p99_ms NUMERIC,
  max_ms INTEGER,
  last_call TIMESTAMPTZ,
  last_error TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    function_name,
    COUNT(*)::BIGINT AS total_calls,
    COUNT(*) FILTER (WHERE NOT ok)::BIGINT AS error_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE NOT ok) / NULLIF(COUNT(*), 0), 2) AS error_rate,
    ROUND(AVG(duration_ms)::NUMERIC, 0) AS avg_ms,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms)::NUMERIC, 0) AS p50_ms,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::NUMERIC, 0) AS p95_ms,
    ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms)::NUMERIC, 0) AS p99_ms,
    MAX(duration_ms) AS max_ms,
    MAX(created_at) AS last_call,
    (
      SELECT error_message FROM public.edge_function_metrics m2
      WHERE m2.function_name = m.function_name AND NOT m2.ok
      ORDER BY created_at DESC LIMIT 1
    ) AS last_error
  FROM public.edge_function_metrics m
  WHERE created_at > now() - interval '7 days'
    AND public.has_role(auth.uid(), 'admin')
  GROUP BY function_name
  ORDER BY error_count DESC, total_calls DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_edge_function_stats_7d() TO authenticated;
