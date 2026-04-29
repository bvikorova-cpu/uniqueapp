
-- Audit log for every credit movement
CREATE TABLE IF NOT EXISTS public.tutoring_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  stripe_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ttx_user ON public.tutoring_credit_transactions(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ttx_session_unique
  ON public.tutoring_credit_transactions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.tutoring_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own credit transactions"
  ON public.tutoring_credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies => only service_role can write
