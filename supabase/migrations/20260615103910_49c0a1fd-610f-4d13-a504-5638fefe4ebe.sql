CREATE TABLE IF NOT EXISTS public.smoke_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL DEFAULT 'manual', -- 'manual' | 'nightly' | 'e2e'
  started_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_routes int NOT NULL DEFAULT 0,
  passed int NOT NULL DEFAULT 0,
  failed int NOT NULL DEFAULT 0,
  blank int NOT NULL DEFAULT 0,
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.smoke_test_runs TO authenticated;
GRANT ALL ON public.smoke_test_runs TO service_role;
ALTER TABLE public.smoke_test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage smoke runs"
ON public.smoke_test_runs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.smoke_test_route_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.smoke_test_runs(id) ON DELETE CASCADE,
  route text NOT NULL,
  status text NOT NULL, -- 'pass' | 'fail' | 'blank' | 'timeout'
  http_status int,
  console_errors jsonb DEFAULT '[]'::jsonb,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smoke_results_run ON public.smoke_test_route_results(run_id);
CREATE INDEX IF NOT EXISTS idx_smoke_results_status ON public.smoke_test_route_results(status);

GRANT SELECT, INSERT ON public.smoke_test_route_results TO authenticated;
GRANT ALL ON public.smoke_test_route_results TO service_role;
ALTER TABLE public.smoke_test_route_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read smoke results"
ON public.smoke_test_route_results FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert smoke results"
ON public.smoke_test_route_results FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));