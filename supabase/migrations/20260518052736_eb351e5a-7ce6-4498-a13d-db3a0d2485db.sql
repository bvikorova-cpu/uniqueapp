
-- Skill Swap parity pack: credits + 8 result tables
CREATE TABLE IF NOT EXISTS public.skill_swap_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_swap_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own ss credits" ON public.skill_swap_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own ss credits" ON public.skill_swap_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own ss credits" ON public.skill_swap_credits FOR UPDATE USING (auth.uid() = user_id);

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'skill_swap_swap_matchers',
    'skill_swap_learning_roadmaps',
    'skill_swap_teaching_scripts',
    'skill_swap_gap_analyses',
    'skill_swap_negotiation_helpers',
    'skill_swap_portfolio_pitches',
    'skill_swap_cultural_tips',
    'skill_swap_certification_paths'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      credits_used INTEGER NOT NULL DEFAULT 6,
      input JSONB,
      result JSONB NOT NULL DEFAULT ''{}''::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "users view own %I" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "users insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (user_id, created_at DESC)', t || '_user_idx', t);
  END LOOP;
END $$;
