-- Create enum for pet species
CREATE TYPE pet_species AS ENUM (
  'cat',
  'dog',
  'rabbit',
  'hamster',
  'bird',
  'dragon',
  'unicorn',
  'phoenix'
);

-- Create enum for pet rarity
CREATE TYPE pet_rarity AS ENUM (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
);

-- Create enum for pet mood
CREATE TYPE pet_mood AS ENUM (
  'happy',
  'neutral',
  'sad',
  'excited',
  'sleepy',
  'hungry'
);

-- Create enum for accessory type
CREATE TYPE accessory_type AS ENUM (
  'hat',
  'clothing',
  'collar',
  'toy',
  'background',
  'effect'
);

-- Pet types (species with stats)
CREATE TABLE IF NOT EXISTS public.pet_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species pet_species NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  base_happiness INTEGER DEFAULT 50,
  base_hunger INTEGER DEFAULT 50,
  base_energy INTEGER DEFAULT 50,
  evolution_levels JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User pets
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_type_id UUID NOT NULL REFERENCES public.pet_types(id),
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  happiness INTEGER DEFAULT 50,
  hunger INTEGER DEFAULT 50,
  energy INTEGER DEFAULT 50,
  mood pet_mood DEFAULT 'neutral',
  birthday TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_fed_at TIMESTAMPTZ,
  last_played_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  evolution_stage INTEGER DEFAULT 0,
  customization JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  total_games_played INTEGER DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pet accessories and items
CREATE TABLE IF NOT EXISTS public.pet_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  accessory_type accessory_type NOT NULL,
  image_url TEXT,
  rarity pet_rarity DEFAULT 'common',
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  effect JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User's owned accessories
CREATE TABLE IF NOT EXISTS public.user_pet_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  accessory_id UUID NOT NULL REFERENCES public.pet_accessories(id),
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, accessory_id)
);

-- Pet activities log
CREATE TABLE IF NOT EXISTS public.pet_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  experience_gained INTEGER DEFAULT 0,
  happiness_change INTEGER DEFAULT 0,
  hunger_change INTEGER DEFAULT 0,
  energy_change INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Breeding system
CREATE TABLE IF NOT EXISTS public.pet_breeding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent1_id UUID NOT NULL REFERENCES public.pets(id),
  parent2_id UUID NOT NULL REFERENCES public.pets(id),
  offspring_id UUID REFERENCES public.pets(id),
  breeding_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  breeding_completed_at TIMESTAMPTZ,
  is_premium_breeding BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trading system
CREATE TABLE IF NOT EXISTS public.pet_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  offered_pet_id UUID NOT NULL REFERENCES public.pets(id),
  requested_pet_id UUID REFERENCES public.pets(id),
  offered_credits INTEGER DEFAULT 0,
  requested_credits INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Mini games scores
CREATE TABLE IF NOT EXISTS public.pet_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES public.pets(id),
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  rewards JSONB DEFAULT '{}',
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pet_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_breeding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_game_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_types
CREATE POLICY "Anyone can view pet types"
  ON public.pet_types FOR SELECT
  USING (true);

-- RLS Policies for pets
CREATE POLICY "Users can view their own pets"
  ON public.pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pets"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON public.pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON public.pets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pet_accessories
CREATE POLICY "Anyone can view accessories"
  ON public.pet_accessories FOR SELECT
  USING (true);

-- RLS Policies for user_pet_accessories
CREATE POLICY "Users can view their own accessories"
  ON public.user_pet_accessories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own accessories"
  ON public.user_pet_accessories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accessories"
  ON public.user_pet_accessories FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for pet_activities
CREATE POLICY "Users can view their own pet activities"
  ON public.pet_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pet activities"
  ON public.pet_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pet_breeding
CREATE POLICY "Users can view their own breeding"
  ON public.pet_breeding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own breeding"
  ON public.pet_breeding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own breeding"
  ON public.pet_breeding FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for pet_trades
CREATE POLICY "Users can view trades involving them"
  ON public.pet_trades FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create trades"
  ON public.pet_trades FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update trades they're involved in"
  ON public.pet_trades FOR UPDATE
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- RLS Policies for pet_game_scores
CREATE POLICY "Users can view their own game scores"
  ON public.pet_game_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game scores"
  ON public.pet_game_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_pets_level ON public.pets(level);
CREATE INDEX idx_pet_activities_pet_id ON public.pet_activities(pet_id);
CREATE INDEX idx_pet_activities_user_id ON public.pet_activities(user_id);
CREATE INDEX idx_pet_breeding_user_id ON public.pet_breeding(user_id);
CREATE INDEX idx_pet_trades_from_user ON public.pet_trades(from_user_id);
CREATE INDEX idx_pet_trades_to_user ON public.pet_trades(to_user_id);
CREATE INDEX idx_pet_trades_status ON public.pet_trades(status);
CREATE INDEX idx_pet_game_scores_user_id ON public.pet_game_scores(user_id);
CREATE INDEX idx_user_pet_accessories_user_id ON public.user_pet_accessories(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pet types
INSERT INTO public.pet_types (species, name, description, is_premium, price, evolution_levels) VALUES
('cat', 'Cat', 'A playful feline companion', false, NULL, '[{"level": 5, "name": "Kitten"}, {"level": 15, "name": "Cat"}, {"level": 30, "name": "Royal Cat"}]'),
('dog', 'Dog', 'A loyal canine friend', false, NULL, '[{"level": 5, "name": "Puppy"}, {"level": 15, "name": "Dog"}, {"level": 30, "name": "Guardian Dog"}]'),
('rabbit', 'Rabbit', 'A cute hopping buddy', false, NULL, '[{"level": 5, "name": "Bunny"}, {"level": 15, "name": "Rabbit"}, {"level": 30, "name": "Magic Rabbit"}]'),
('dragon', 'Dragon', 'A mythical flying creature', true, 500.00, '[{"level": 5, "name": "Hatchling"}, {"level": 15, "name": "Young Dragon"}, {"level": 30, "name": "Ancient Dragon"}]'),
('unicorn', 'Unicorn', 'A magical horned horse', true, 500.00, '[{"level": 5, "name": "Foal"}, {"level": 15, "name": "Unicorn"}, {"level": 30, "name": "Celestial Unicorn"}]'),
('phoenix', 'Phoenix', 'A legendary fire bird', true, 750.00, '[{"level": 5, "name": "Chick"}, {"level": 15, "name": "Phoenix"}, {"level": 30, "name": "Eternal Phoenix"}]');

-- Insert default accessories
INSERT INTO public.pet_accessories (name, description, accessory_type, rarity, is_premium, price) VALUES
('Red Hat', 'A stylish red hat', 'hat', 'common', false, 10.00),
('Blue Collar', 'A simple blue collar', 'collar', 'common', false, 5.00),
('Rainbow Wings', 'Magical rainbow wings', 'effect', 'epic', true, 100.00),
('Golden Crown', 'A royal golden crown', 'hat', 'legendary', true, 250.00),
('Sparkle Effect', 'Sparkles around your pet', 'effect', 'rare', true, 50.00),
('Cute Bow', 'A cute pink bow', 'clothing', 'uncommon', false, 15.00);