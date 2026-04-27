
CREATE TABLE IF NOT EXISTS public.reconciliation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL,
  trigger_source text NOT NULL DEFAULT 'manual',
  stripe_charges int NOT NULL DEFAULT 0,
  db_records int NOT NULL DEFAULT 0,
  missing_in_db int NOT NULL DEFAULT 0,
  missing_in_stripe int NOT NULL DEFAULT 0,
  amount_mismatch int NOT NULL DEFAULT 0,
  status_mismatch int NOT NULL DEFAULT 0,
  details jsonb,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_runs_date ON public.reconciliation_runs(run_date DESC);

ALTER TABLE public.reconciliation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view reconciliation runs"
  ON public.reconciliation_runs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert reconciliation runs"
  ON public.reconciliation_runs FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
