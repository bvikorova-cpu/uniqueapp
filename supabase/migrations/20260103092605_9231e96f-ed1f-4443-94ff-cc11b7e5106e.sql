-- Table to track daily XP claims via video ads
CREATE TABLE public.daily_xp_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  xp_earned INTEGER NOT NULL DEFAULT 1,
  ad_watched BOOLEAN NOT NULL DEFAULT true,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, claim_date)
);

-- Enable RLS
ALTER TABLE public.daily_xp_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view their own daily XP claims"
ON public.daily_xp_claims
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own claims
CREATE POLICY "Users can insert their own daily XP claims"
ON public.daily_xp_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_daily_xp_claims_user_date ON public.daily_xp_claims(user_id, claim_date);