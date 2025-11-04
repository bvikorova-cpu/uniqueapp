-- Create F1 user credits table
CREATE TABLE IF NOT EXISTS public.f1_user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  tier TEXT CHECK (tier IN ('pro', 'elite', 'team')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.f1_user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credits"
  ON public.f1_user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.f1_user_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create F1 fantasy teams table
CREATE TABLE IF NOT EXISTS public.f1_fantasy_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  team_name TEXT NOT NULL,
  driver1_id TEXT,
  driver2_id TEXT,
  constructor_id TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.f1_fantasy_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own teams"
  ON public.f1_fantasy_teams
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own teams"
  ON public.f1_fantasy_teams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams"
  ON public.f1_fantasy_teams
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams"
  ON public.f1_fantasy_teams
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create F1 leaderboard table
CREATE TABLE IF NOT EXISTS public.f1_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.f1_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policy - everyone can view leaderboard
CREATE POLICY "Anyone can view leaderboard"
  ON public.f1_leaderboard
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own leaderboard entry"
  ON public.f1_leaderboard
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_f1_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_f1_credits_updated_at
  BEFORE UPDATE ON public.f1_user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_f1_updated_at_column();

CREATE TRIGGER update_f1_fantasy_teams_updated_at
  BEFORE UPDATE ON public.f1_fantasy_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_f1_updated_at_column();

CREATE TRIGGER update_f1_leaderboard_updated_at
  BEFORE UPDATE ON public.f1_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_f1_updated_at_column();