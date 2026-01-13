-- Create voting streaks table to track consecutive voting days
CREATE TABLE public.voting_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_vote_date DATE,
  total_votes_cast INTEGER NOT NULL DEFAULT 0,
  credits_earned INTEGER NOT NULL DEFAULT 0,
  streak_bonus_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.voting_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own streak" 
ON public.voting_streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak" 
ON public.voting_streaks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak" 
ON public.voting_streaks FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_voting_streaks_updated_at
BEFORE UPDATE ON public.voting_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add credits columns to user_daily_votes if not exists
ALTER TABLE public.user_daily_votes 
ADD COLUMN IF NOT EXISTS credits_earned INTEGER DEFAULT 0;

-- Create brand_battle_credits table to track user credits from Brand Battle
CREATE TABLE public.brand_battle_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  total_credits_earned INTEGER NOT NULL DEFAULT 0,
  total_credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_battle_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credits
CREATE POLICY "Users can view their own credits" 
ON public.brand_battle_credits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" 
ON public.brand_battle_credits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.brand_battle_credits FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_brand_battle_credits_updated_at
BEFORE UPDATE ON public.brand_battle_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();