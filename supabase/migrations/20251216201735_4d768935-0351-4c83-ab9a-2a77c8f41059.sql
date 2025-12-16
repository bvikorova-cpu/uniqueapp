-- Create pet battles table
CREATE TABLE IF NOT EXISTS public.pet_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  challenger_pets UUID[] NOT NULL,
  opponent_pets UUID[] NOT NULL,
  challenger_power INTEGER NOT NULL DEFAULT 0,
  opponent_power INTEGER NOT NULL DEFAULT 0,
  winner_id UUID,
  battle_type TEXT NOT NULL DEFAULT 'pvp' CHECK (battle_type IN ('pvp', 'ai')),
  xp_earned INTEGER DEFAULT 0,
  credits_bet INTEGER DEFAULT 0,
  battle_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_battles ENABLE ROW LEVEL SECURITY;

-- Users can view their own battles
CREATE POLICY "Users can view their own battles"
ON public.pet_battles FOR SELECT
USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Users can create battles
CREATE POLICY "Users can create battles"
ON public.pet_battles FOR INSERT
WITH CHECK (auth.uid() = challenger_id);

-- Add battle stats to pets
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS battle_wins INTEGER DEFAULT 0;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS battle_losses INTEGER DEFAULT 0;