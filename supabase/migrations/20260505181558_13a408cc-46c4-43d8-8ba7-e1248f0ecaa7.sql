CREATE TABLE IF NOT EXISTS public.comedy_coin_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  coins integer NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comedy_coin_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comedy purchases"
  ON public.comedy_coin_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS comedy_coin_purchases_user_idx
  ON public.comedy_coin_purchases(user_id, created_at DESC);