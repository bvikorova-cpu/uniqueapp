
-- Homework credits table (paid-only, 3 credits per AI question)
CREATE TABLE IF NOT EXISTS public.homework_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homework_credits ENABLE ROW LEVEL SECURITY;

-- Users can view only their own balance
CREATE POLICY "Users view their homework credits"
  ON public.homework_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own zero-balance row (lazy create)
CREATE POLICY "Users create their homework credits row"
  ON public.homework_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No client-side UPDATE/DELETE — handled by edge functions via service role
CREATE INDEX IF NOT EXISTS idx_homework_credits_user ON public.homework_credits(user_id);

-- updated_at trigger
CREATE TRIGGER homework_credits_updated_at
  BEFORE UPDATE ON public.homework_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
