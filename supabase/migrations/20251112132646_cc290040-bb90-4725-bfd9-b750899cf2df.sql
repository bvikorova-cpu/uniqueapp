-- Add match_id and accepted_at columns to brain_duel_friend_challenges if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brain_duel_friend_challenges' 
    AND column_name = 'match_id'
  ) THEN
    ALTER TABLE public.brain_duel_friend_challenges 
    ADD COLUMN match_id UUID REFERENCES public.brain_duel_matches(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brain_duel_friend_challenges' 
    AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE public.brain_duel_friend_challenges 
    ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;