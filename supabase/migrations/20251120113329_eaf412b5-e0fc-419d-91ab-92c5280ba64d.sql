-- Create pet_game_scores table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pet_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('catch', 'memory', 'race', 'puzzle')),
  score INTEGER NOT NULL DEFAULT 0,
  rewards JSONB DEFAULT '{"xp": 0, "happiness": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on pet_game_scores
ALTER TABLE public.pet_game_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view all game scores" ON public.pet_game_scores;
  DROP POLICY IF EXISTS "Users can create their own game scores" ON public.pet_game_scores;
END $$;

-- Pet game scores policies
CREATE POLICY "Users can view all game scores"
  ON public.pet_game_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own game scores"
  ON public.pet_game_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_game_scores_user ON public.pet_game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_game_scores_pet ON public.pet_game_scores(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_game_scores_score ON public.pet_game_scores(score DESC);