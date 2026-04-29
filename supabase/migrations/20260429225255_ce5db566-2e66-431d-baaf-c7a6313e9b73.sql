CREATE TABLE IF NOT EXISTS public.teen_career_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teen_career_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own teen career credits"
  ON public.teen_career_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own teen career credits"
  ON public.teen_career_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_teen_career_credits_updated_at
  BEFORE UPDATE ON public.teen_career_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_teen_career_credits_user ON public.teen_career_credits(user_id);