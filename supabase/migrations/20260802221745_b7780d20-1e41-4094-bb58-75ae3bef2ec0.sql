CREATE TABLE IF NOT EXISTS public.past_life_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_last_date TIMESTAMP WITH TIME ZONE,
  visions_claimed TEXT[] NOT NULL DEFAULT '{}',
  achievements_unlocked TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.past_life_user_stats TO authenticated;
GRANT ALL ON public.past_life_user_stats TO service_role;

ALTER TABLE public.past_life_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own past life stats"
  ON public.past_life_user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own past life stats"
  ON public.past_life_user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own past life stats"
  ON public.past_life_user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_past_life_user_stats_user_id ON public.past_life_user_stats(user_id);

CREATE OR REPLACE FUNCTION public.update_past_life_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER past_life_user_stats_updated_at
  BEFORE UPDATE ON public.past_life_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_past_life_user_stats_updated_at();