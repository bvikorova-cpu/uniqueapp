
-- Clone battles table
CREATE TABLE IF NOT EXISTS public.clone_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_clone_id UUID,
  opponent_clone_id UUID,
  winner TEXT NOT NULL CHECK (winner IN ('user','opponent','draw')),
  user_clone_name TEXT,
  opponent_clone_name TEXT,
  analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clone_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own clone battles" ON public.clone_battles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert clone battles" ON public.clone_battles FOR INSERT WITH CHECK (true);

-- Dream vote dedup
CREATE TABLE IF NOT EXISTS public.dream_battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpretation_id UUID NOT NULL,
  voter_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (interpretation_id, voter_id)
);
ALTER TABLE public.dream_battle_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dream votes" ON public.dream_battle_votes FOR SELECT USING (true);

-- Lock down direct vote counter updates
DROP POLICY IF EXISTS "Owners can update their interpretations" ON public.dream_battle_interpretations;
DROP POLICY IF EXISTS "Users can update own entries" ON public.fashion_battle_entries;

-- Prevent double-voting in existing tables (will succeed only if no current dups)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.fashion_battle_votes ADD CONSTRAINT fashion_battle_votes_unique UNIQUE (entry_id, voter_id);
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN unique_violation THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.battle_votes ADD CONSTRAINT battle_votes_unique UNIQUE (battle_id, participant_id, user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN unique_violation THEN NULL;
  END;
END $$;
