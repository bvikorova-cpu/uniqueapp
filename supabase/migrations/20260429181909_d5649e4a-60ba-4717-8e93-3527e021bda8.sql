-- Science Lab credits table (paid-only, no free tier)
CREATE TABLE IF NOT EXISTS public.science_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.science_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own science credits"
  ON public.science_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own science credits"
  ON public.science_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own science credits"
  ON public.science_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Reuse existing timestamp trigger
CREATE TRIGGER update_science_credits_updated_at
  BEFORE UPDATE ON public.science_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_science_credits_user ON public.science_credits(user_id);