
CREATE TABLE IF NOT EXISTS public.skill_swap_members (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_session_id TEXT UNIQUE,
  amount_paid_cents INTEGER NOT NULL DEFAULT 100
);
GRANT SELECT ON public.skill_swap_members TO authenticated;
GRANT ALL ON public.skill_swap_members TO service_role;
ALTER TABLE public.skill_swap_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own skill swap membership"
  ON public.skill_swap_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
