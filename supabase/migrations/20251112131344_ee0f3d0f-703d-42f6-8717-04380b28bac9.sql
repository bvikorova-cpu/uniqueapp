-- Create brain_duel_friend_challenges table
CREATE TABLE IF NOT EXISTS public.brain_duel_friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  stake_credits INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  match_id UUID REFERENCES public.brain_duel_matches(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.brain_duel_friend_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for brain_duel_friend_challenges
CREATE POLICY "Users can view their own challenges"
  ON public.brain_duel_friend_challenges
  FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
  ON public.brain_duel_friend_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Challenged users can update challenges"
  ON public.brain_duel_friend_challenges
  FOR UPDATE
  USING (auth.uid() = challenged_id OR auth.uid() = challenger_id);

CREATE POLICY "Users can delete their own challenges"
  ON public.brain_duel_friend_challenges
  FOR DELETE
  USING (auth.uid() = challenger_id);

-- Create index for performance
CREATE INDEX idx_brain_duel_friend_challenges_challenger ON public.brain_duel_friend_challenges(challenger_id);
CREATE INDEX idx_brain_duel_friend_challenges_challenged ON public.brain_duel_friend_challenges(challenged_id);
CREATE INDEX idx_brain_duel_friend_challenges_status ON public.brain_duel_friend_challenges(status);

-- Create brain_duel_powerups table for purchased power-ups
CREATE TABLE IF NOT EXISTS public.brain_duel_powerups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  powerup_type TEXT NOT NULL CHECK (powerup_type IN ('fifty-fifty', 'ask-ai', 'extra-time', 'double-points')),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, powerup_type)
);

-- Enable RLS for powerups
ALTER TABLE public.brain_duel_powerups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own powerups"
  ON public.brain_duel_powerups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own powerups"
  ON public.brain_duel_powerups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own powerups"
  ON public.brain_duel_powerups
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to purchase powerup
CREATE OR REPLACE FUNCTION public.purchase_brain_duel_powerup(
  p_powerup_type TEXT,
  p_price INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.brain_duel_credits
  WHERE user_id = auth.uid();
  
  -- Check if user has enough credits
  IF v_current_credits IS NULL OR v_current_credits < p_price THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credits
  UPDATE public.brain_duel_credits
  SET credits = credits - p_price,
      updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Add or update powerup
  INSERT INTO public.brain_duel_powerups (user_id, powerup_type, quantity)
  VALUES (auth.uid(), p_powerup_type, 1)
  ON CONFLICT (user_id, powerup_type)
  DO UPDATE SET 
    quantity = brain_duel_powerups.quantity + 1,
    updated_at = now();
END;
$$;