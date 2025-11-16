-- SuperHero Universe Database Schema

-- User credits/wallet system
CREATE TABLE IF NOT EXISTS public.superhero_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 1000,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Heroes table
CREATE TABLE IF NOT EXISTS public.superhero_heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  power_type TEXT NOT NULL CHECK (power_type IN ('strength', 'speed', 'intelligence', 'energy', 'elemental')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'mythic')),
  power_level INTEGER NOT NULL DEFAULT 1000,
  strength INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  intelligence INTEGER NOT NULL DEFAULT 50,
  defense INTEGER NOT NULL DEFAULT 50,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS public.superhero_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entry_fee INTEGER NOT NULL DEFAULT 500,
  prize_pool INTEGER NOT NULL,
  max_teams INTEGER NOT NULL,
  current_teams INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN ('registration', 'in_progress', 'completed', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  winner_id UUID REFERENCES public.superhero_heroes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournament participants
CREATE TABLE IF NOT EXISTS public.superhero_tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.superhero_tournaments(id) ON DELETE CASCADE,
  hero_id UUID NOT NULL REFERENCES public.superhero_heroes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placement INTEGER,
  prize_won INTEGER DEFAULT 0,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, hero_id)
);

-- Battle history
CREATE TABLE IF NOT EXISTS public.superhero_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.superhero_tournaments(id),
  hero1_id UUID NOT NULL REFERENCES public.superhero_heroes(id) ON DELETE CASCADE,
  hero2_id UUID NOT NULL REFERENCES public.superhero_heroes(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.superhero_heroes(id),
  hero1_damage INTEGER,
  hero2_damage INTEGER,
  battle_log JSONB,
  battle_type TEXT DEFAULT 'friendly' CHECK (battle_type IN ('friendly', 'tournament', 'ranked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Age verification for legal compliance
CREATE TABLE IF NOT EXISTS public.superhero_age_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.superhero_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superhero_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superhero_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superhero_tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superhero_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superhero_age_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credits
CREATE POLICY "Users can view own credits" ON public.superhero_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.superhero_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.superhero_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for heroes
CREATE POLICY "Users can view all heroes" ON public.superhero_heroes FOR SELECT USING (true);
CREATE POLICY "Users can create own heroes" ON public.superhero_heroes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own heroes" ON public.superhero_heroes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own heroes" ON public.superhero_heroes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tournaments
CREATE POLICY "Everyone can view tournaments" ON public.superhero_tournaments FOR SELECT USING (true);

-- RLS Policies for tournament participants
CREATE POLICY "Everyone can view participants" ON public.superhero_tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.superhero_tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for battles
CREATE POLICY "Everyone can view battles" ON public.superhero_battles FOR SELECT USING (true);

-- RLS Policies for age verification
CREATE POLICY "Users can view own verification" ON public.superhero_age_verification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verification" ON public.superhero_age_verification FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_heroes_user_id ON public.superhero_heroes(user_id);
CREATE INDEX idx_heroes_power_level ON public.superhero_heroes(power_level DESC);
CREATE INDEX idx_tournaments_status ON public.superhero_tournaments(status);
CREATE INDEX idx_battles_tournament ON public.superhero_battles(tournament_id);

-- Function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_superhero_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.superhero_credits (user_id, credits)
  VALUES (NEW.id, 1000)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create credits for new users
CREATE TRIGGER on_auth_user_created_superhero
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_superhero_credits();

-- Function to update hero stats after battle
CREATE OR REPLACE FUNCTION public.update_hero_battle_stats(
  p_hero_id UUID,
  p_won BOOLEAN,
  p_exp_gained INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.superhero_heroes
  SET 
    total_battles = total_battles + 1,
    total_wins = CASE WHEN p_won THEN total_wins + 1 ELSE total_wins END,
    total_losses = CASE WHEN NOT p_won THEN total_losses + 1 ELSE total_losses END,
    experience = experience + p_exp_gained,
    level = FLOOR((experience + p_exp_gained) / 1000) + 1,
    power_level = power_level + (CASE WHEN p_won THEN 50 ELSE -25 END),
    updated_at = now()
  WHERE id = p_hero_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check age verification (18+)
CREATE OR REPLACE FUNCTION public.is_age_verified(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_verified BOOLEAN;
BEGIN
  SELECT is_verified INTO v_verified
  FROM public.superhero_age_verification
  WHERE user_id = p_user_id AND EXTRACT(YEAR FROM AGE(birth_date)) >= 18;
  
  RETURN COALESCE(v_verified, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;