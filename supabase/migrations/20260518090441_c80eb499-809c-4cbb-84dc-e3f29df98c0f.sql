
CREATE TABLE public.membership_parity_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.membership_parity_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own credits select" ON public.membership_parity_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own credits insert" ON public.membership_parity_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'membership_parity_tier_designers',
    'membership_parity_post_planners',
    'membership_parity_fan_personas',
    'membership_parity_welcome_dms',
    'membership_parity_retention_boosters',
    'membership_parity_perk_ideas',
    'membership_parity_livestream_briefs',
    'membership_parity_growth_funnels'
  ] LOOP
    EXECUTE format('CREATE TABLE public.%I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      input JSONB NOT NULL DEFAULT ''{}''::jsonb,
      result JSONB NOT NULL DEFAULT ''{}''::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "own select" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "own insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "own update" ON public.%I FOR UPDATE USING (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "own delete" ON public.%I FOR DELETE USING (auth.uid() = user_id);', t);
    EXECUTE format('CREATE INDEX %I ON public.%I (user_id, created_at DESC);', t || '_user_idx', t);
  END LOOP;
END $$;
