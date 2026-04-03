
-- Basketball Arena Module

CREATE TABLE public.basketball_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.basketball_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own basketball coins" ON public.basketball_coins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.basketball_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'SG',
  overall_rating INTEGER NOT NULL DEFAULT 60,
  shooting INTEGER NOT NULL DEFAULT 50,
  passing INTEGER NOT NULL DEFAULT 50,
  defense INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  rebounding INTEGER NOT NULL DEFAULT 50,
  stamina INTEGER NOT NULL DEFAULT 50,
  three_point INTEGER NOT NULL DEFAULT 50,
  dunking INTEGER NOT NULL DEFAULT 50,
  market_value INTEGER NOT NULL DEFAULT 1000,
  is_for_sale BOOLEAN NOT NULL DEFAULT false,
  sale_price INTEGER,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  games_played INTEGER NOT NULL DEFAULT 0,
  points_scored INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  rebounds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own basketball players" ON public.basketball_players FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view players for sale" ON public.basketball_players FOR SELECT USING (is_for_sale = true);

CREATE TABLE public.basketball_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  playstyle TEXT NOT NULL DEFAULT 'Balanced',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  league_points INTEGER NOT NULL DEFAULT 0,
  stadium_level INTEGER NOT NULL DEFAULT 1,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.basketball_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own basketball team" ON public.basketball_teams FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view basketball teams" ON public.basketball_teams FOR SELECT USING (true);

CREATE TABLE public.basketball_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.basketball_teams(id),
  away_team_id UUID REFERENCES public.basketball_teams(id),
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  quarter_scores JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  coins_reward INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own basketball matches" ON public.basketball_matches FOR SELECT USING (
  home_team_id IN (SELECT id FROM public.basketball_teams WHERE user_id = auth.uid()) OR
  away_team_id IN (SELECT id FROM public.basketball_teams WHERE user_id = auth.uid())
);
CREATE POLICY "Users create own basketball matches" ON public.basketball_matches FOR INSERT WITH CHECK (
  home_team_id IN (SELECT id FROM public.basketball_teams WHERE user_id = auth.uid())
);

CREATE TABLE public.basketball_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  shooting_boost INTEGER NOT NULL DEFAULT 0,
  speed_boost INTEGER NOT NULL DEFAULT 0,
  defense_boost INTEGER NOT NULL DEFAULT 0,
  stamina_boost INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  player_id UUID REFERENCES public.basketball_players(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own basketball equipment" ON public.basketball_equipment FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.basketball_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.basketball_players(id),
  training_type TEXT NOT NULL,
  stat_improved TEXT NOT NULL,
  improvement_amount INTEGER NOT NULL DEFAULT 1,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own basketball training" ON public.basketball_training_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.basketball_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 1,
  entry_fee INTEGER NOT NULL DEFAULT 0,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  max_teams INTEGER NOT NULL DEFAULT 16,
  status TEXT NOT NULL DEFAULT 'open',
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view basketball leagues" ON public.basketball_leagues FOR SELECT USING (true);

CREATE TABLE public.basketball_league_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.basketball_leagues(id),
  team_id UUID REFERENCES public.basketball_teams(id),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.basketball_league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view basketball standings" ON public.basketball_league_standings FOR SELECT USING (true);
CREATE POLICY "Users manage own basketball standings" ON public.basketball_league_standings FOR INSERT WITH CHECK (
  team_id IN (SELECT id FROM public.basketball_teams WHERE user_id = auth.uid())
);

CREATE TABLE public.basketball_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID,
  player_id UUID REFERENCES public.basketball_players(id),
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.basketball_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view basketball transfers" ON public.basketball_transfers FOR SELECT USING (true);
CREATE POLICY "Sellers manage own basketball transfers" ON public.basketball_transfers FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Buyers can update basketball transfers" ON public.basketball_transfers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TABLE public.basketball_stadiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Home Court',
  capacity INTEGER NOT NULL DEFAULT 5000,
  facilities_level INTEGER NOT NULL DEFAULT 1,
  court_type TEXT NOT NULL DEFAULT 'standard',
  revenue_per_match INTEGER NOT NULL DEFAULT 100,
  total_upgrades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.basketball_stadiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own basketball stadium" ON public.basketball_stadiums FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
