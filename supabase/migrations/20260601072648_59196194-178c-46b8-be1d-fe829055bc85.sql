CREATE TABLE IF NOT EXISTS public.monthly_credit_grant_failures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grant_month date NOT NULL,
  failure_count integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.monthly_credit_grant_failures TO authenticated;
GRANT ALL ON public.monthly_credit_grant_failures TO service_role;

ALTER TABLE public.monthly_credit_grant_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view failure logs"
ON public.monthly_credit_grant_failures
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_mcgf_grant_month ON public.monthly_credit_grant_failures(grant_month DESC);