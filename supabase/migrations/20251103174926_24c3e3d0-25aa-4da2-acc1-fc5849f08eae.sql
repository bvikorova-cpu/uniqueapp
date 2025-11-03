-- Create all tables first
CREATE TABLE IF NOT EXISTS public.user_currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  gems INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 100,
  total_gems_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT gems_non_negative CHECK (gems >= 0),
  CONSTRAINT coins_non_negative CHECK (coins >= 0)
);

CREATE TABLE IF NOT EXISTS public.horses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'brown',
  speed_stat INTEGER NOT NULL DEFAULT 50,
  stamina_stat INTEGER NOT NULL DEFAULT 50,
  acceleration_stat INTEGER NOT NULL DEFAULT 50,
  temperament_stat INTEGER NOT NULL DEFAULT 50,
  rarity TEXT NOT NULL DEFAULT 'common',
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  age_days INTEGER NOT NULL DEFAULT 0,
  breeding_count INTEGER NOT NULL DEFAULT 0,
  max_breeding INTEGER NOT NULL DEFAULT 3,
  is_retired BOOLEAN NOT NULL DEFAULT false,
  total_races INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT speed_range CHECK (speed_stat >= 0 AND speed_stat <= 100),
  CONSTRAINT stamina_range CHECK (stamina_stat >= 0 AND stamina_stat <= 100),
  CONSTRAINT acceleration_range CHECK (acceleration_stat >= 0 AND acceleration_stat <= 100),
  CONSTRAINT temperament_range CHECK (temperament_stat >= 0 AND temperament_stat <= 100),
  CONSTRAINT valid_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE TABLE IF NOT EXISTS public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  distance INTEGER NOT NULL,
  entry_fee_coins INTEGER NOT NULL DEFAULT 10,
  max_participants INTEGER NOT NULL DEFAULT 8,
  prize_pool_coins INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting',
  weather TEXT NOT NULL DEFAULT 'clear',
  track_condition TEXT NOT NULL DEFAULT 'good',
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'starting', 'running', 'finished', 'cancelled')),
  CONSTRAINT valid_weather CHECK (weather IN ('clear', 'rainy', 'foggy', 'sunny')),
  CONSTRAINT valid_track_condition CHECK (track_condition IN ('excellent', 'good', 'muddy', 'fast'))
);

CREATE TABLE IF NOT EXISTS public.race_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'balanced',
  position INTEGER,
  finish_time_ms INTEGER,
  coins_won INTEGER DEFAULT 0,
  experience_gained INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_strategy CHECK (strategy IN ('aggressive', 'balanced', 'conservative', 'sprint_finish'))
);

CREATE TABLE IF NOT EXISTS public.horse_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  progress INTEGER NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_training_type CHECK (training_type IN ('speed', 'stamina', 'acceleration', 'temperament')),
  CONSTRAINT training_level_range CHECK (level >= 1 AND level <= 20)
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'horse_training_horse_id_training_type_key'
  ) THEN
    ALTER TABLE public.horse_training ADD CONSTRAINT horse_training_horse_id_training_type_key UNIQUE(horse_id, training_type);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.breeding_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent1_id UUID NOT NULL REFERENCES public.horses(id),
  parent2_id UUID NOT NULL REFERENCES public.horses(id),
  offspring_id UUID REFERENCES public.horses(id),
  user_id UUID NOT NULL,
  cost_coins INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  bred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ready_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_breeding_status CHECK (status IN ('pending', 'ready', 'claimed'))
);

CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entry_fee_coins INTEGER NOT NULL,
  prize_pool_coins INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 32,
  min_horse_level INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'registration',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tournament_status CHECK (status IN ('registration', 'active', 'finished', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.cosmetic_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL,
  price_gems INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_item_type CHECK (item_type IN ('saddle', 'bridle', 'blanket', 'leg_wraps', 'mane_style', 'tail_style')),
  CONSTRAINT valid_cosmetic_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.cosmetic_items(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES public.horses(id) ON DELETE SET NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horse_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Now drop and recreate all policies
DROP POLICY IF EXISTS "Users can view their own currency" ON public.user_currencies;
DROP POLICY IF EXISTS "Users can update their own currency" ON public.user_currencies;
DROP POLICY IF EXISTS "Users can insert their own currency" ON public.user_currencies;

CREATE POLICY "Users can view their own currency" ON public.user_currencies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own currency" ON public.user_currencies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own currency" ON public.user_currencies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Horses policies
DROP POLICY IF EXISTS "Users can view their own horses" ON public.horses;
DROP POLICY IF EXISTS "Users can create their own horses" ON public.horses;
DROP POLICY IF EXISTS "Users can update their own horses" ON public.horses;
DROP POLICY IF EXISTS "Users can delete their own horses" ON public.horses;

CREATE POLICY "Users can view their own horses" ON public.horses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own horses" ON public.horses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own horses" ON public.horses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own horses" ON public.horses
  FOR DELETE USING (auth.uid() = user_id);

-- Races policies
DROP POLICY IF EXISTS "Anyone can view races" ON public.races;
DROP POLICY IF EXISTS "Authenticated users can create races" ON public.races;

CREATE POLICY "Anyone can view races" ON public.races FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create races" ON public.races FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Race participants policies
DROP POLICY IF EXISTS "Anyone can view race participants" ON public.race_participants;
DROP POLICY IF EXISTS "Users can join races with their horses" ON public.race_participants;

CREATE POLICY "Anyone can view race participants" ON public.race_participants FOR SELECT USING (true);
CREATE POLICY "Users can join races with their horses" ON public.race_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Horse training policies
DROP POLICY IF EXISTS "Users can view training for their horses" ON public.horse_training;
DROP POLICY IF EXISTS "Users can train their own horses" ON public.horse_training;
DROP POLICY IF EXISTS "Users can update training for their horses" ON public.horse_training;

CREATE POLICY "Users can view training for their horses" ON public.horse_training
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.horses WHERE horses.id = horse_training.horse_id AND horses.user_id = auth.uid()));
CREATE POLICY "Users can train their own horses" ON public.horse_training
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.horses WHERE horses.id = horse_training.horse_id AND horses.user_id = auth.uid()));
CREATE POLICY "Users can update training for their horses" ON public.horse_training
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.horses WHERE horses.id = horse_training.horse_id AND horses.user_id = auth.uid()));

-- Breeding policies
DROP POLICY IF EXISTS "Users can view their breeding records" ON public.breeding_records;
DROP POLICY IF EXISTS "Users can create breeding records" ON public.breeding_records;
DROP POLICY IF EXISTS "Users can update their breeding records" ON public.breeding_records;

CREATE POLICY "Users can view their breeding records" ON public.breeding_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create breeding records" ON public.breeding_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their breeding records" ON public.breeding_records FOR UPDATE USING (auth.uid() = user_id);

-- Tournament and cosmetic policies
DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Anyone can view cosmetic items" ON public.cosmetic_items;

CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can view cosmetic items" ON public.cosmetic_items FOR SELECT USING (true);

-- Inventory policies
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.user_inventory;
DROP POLICY IF EXISTS "Users can manage their own inventory" ON public.user_inventory;

CREATE POLICY "Users can view their own inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own inventory" ON public.user_inventory FOR ALL USING (auth.uid() = user_id);

-- Create triggers
DROP TRIGGER IF EXISTS update_user_currencies_updated_at ON public.user_currencies;
DROP TRIGGER IF EXISTS update_horses_updated_at ON public.horses;

CREATE TRIGGER update_user_currencies_updated_at BEFORE UPDATE ON public.user_currencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_horses_updated_at BEFORE UPDATE ON public.horses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_horses_user_id ON public.horses(user_id);
CREATE INDEX IF NOT EXISTS idx_horses_rarity ON public.horses(rarity);
CREATE INDEX IF NOT EXISTS idx_races_status ON public.races(status);
CREATE INDEX IF NOT EXISTS idx_race_participants_race_id ON public.race_participants(race_id);
CREATE INDEX IF NOT EXISTS idx_race_participants_horse_id ON public.race_participants(horse_id);
CREATE INDEX IF NOT EXISTS idx_user_currencies_user_id ON public.user_currencies(user_id);
CREATE INDEX IF NOT EXISTS idx_horse_training_horse_id ON public.horse_training(horse_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_user_id ON public.breeding_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);