CREATE TABLE IF NOT EXISTS public.megatalent_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tier TEXT NOT NULL DEFAULT 'bronze',
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

ALTER TABLE public.megatalent_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are publicly viewable"
ON public.megatalent_achievements FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own achievements"
ON public.megatalent_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_megatalent_achievements_user ON public.megatalent_achievements(user_id);