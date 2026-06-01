CREATE TABLE public.monthly_credit_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  grant_month DATE NOT NULL,
  credits_granted INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, grant_month)
);

GRANT SELECT ON public.monthly_credit_grants TO authenticated;
GRANT ALL ON public.monthly_credit_grants TO service_role;

ALTER TABLE public.monthly_credit_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own monthly grants"
ON public.monthly_credit_grants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_monthly_credit_grants_month ON public.monthly_credit_grants(grant_month);