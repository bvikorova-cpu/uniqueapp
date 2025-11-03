-- Disney Castle Tours tables
CREATE TABLE IF NOT EXISTS public.disney_castles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  park_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  description TEXT,
  fun_facts TEXT[],
  price_coins INTEGER NOT NULL DEFAULT 50,
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.disney_castle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  castle_id UUID REFERENCES public.disney_castles(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  description TEXT,
  panorama_url TEXT NOT NULL,
  hotspots JSONB DEFAULT '[]'::jsonb,
  audio_guide_text TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_castle_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  castle_id UUID REFERENCES public.disney_castles(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  rooms_visited TEXT[] DEFAULT '{}',
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, castle_id)
);

CREATE TABLE IF NOT EXISTS public.user_castle_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  castle_id UUID REFERENCES public.disney_castles(id) ON DELETE CASCADE,
  stamp_url TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, castle_id)
);

-- Enable RLS
ALTER TABLE public.disney_castles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disney_castle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_castle_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_castle_stamps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Castles are viewable by everyone"
  ON public.disney_castles FOR SELECT
  USING (true);

CREATE POLICY "Castle rooms are viewable by everyone"
  ON public.disney_castle_rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own visits"
  ON public.user_castle_visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits"
  ON public.user_castle_visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
  ON public.user_castle_visits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stamps"
  ON public.user_castle_stamps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stamps"
  ON public.user_castle_stamps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert Disney Castles data
INSERT INTO public.disney_castles (name, location, park_name, country_code, description, fun_facts, price_coins) VALUES
('Cinderella Castle', 'Magic Kingdom', 'Walt Disney World', 'US', 'The iconic centerpiece of Magic Kingdom, standing 189 feet tall and inspired by French châteaux.', 
  ARRAY['It''s 189 feet tall!', 'Contains a secret suite', 'Uses forced perspective', 'Can''t be struck by lightning'], 50),
('Sleeping Beauty Castle', 'Disneyland Park', 'Disneyland Resort', 'US', 'The original Disney castle, opened in 1955, featuring a walk-through attraction inside.',
  ARRAY['First Disney castle ever built', 'Only 77 feet tall', 'Has a working drawbridge', 'Walk-through attraction inside'], 50),
('Le Château de la Belle au Bois Dormant', 'Disneyland Paris', 'Disneyland Paris', 'FR', 'A unique pink castle inspired by French fairy tales, featuring a dragon animatronic underneath.',
  ARRAY['Has a dragon underneath!', 'Pink color scheme', 'Tallest at 167 feet', 'French Renaissance design'], 50),
('Castle of Magical Dreams', 'Hong Kong Disneyland', 'Hong Kong Disneyland', 'HK', 'The newest Disney castle, celebrating 13 Disney princesses and heroines.',
  ARRAY['Newest Disney castle', '13 princess towers', 'Features day-to-night transformation', 'Interactive elements'], 50),
('Enchanted Storybook Castle', 'Shanghai Disneyland', 'Shanghai Disneyland', 'CN', 'The tallest Disney castle at 197 feet, featuring attractions, dining, and interactive experiences.',
  ARRAY['Tallest Disney castle at 197 feet!', 'First castle with attractions inside', 'Boat ride through the castle', 'Royal Banquet Hall'], 50),
('Cinderella Castle', 'Tokyo Disneyland', 'Tokyo Disney Resort', 'JP', 'A stunning recreation of the Magic Kingdom castle with unique Japanese touches.',
  ARRAY['Almost identical to Florida', 'Special Japanese events', 'Beautiful night projections', 'Cherry blossom decorations'], 50);

-- Create indexes
CREATE INDEX idx_castle_rooms_castle_id ON public.disney_castle_rooms(castle_id);
CREATE INDEX idx_user_visits_user_id ON public.user_castle_visits(user_id);
CREATE INDEX idx_user_visits_castle_id ON public.user_castle_visits(castle_id);
CREATE INDEX idx_user_stamps_user_id ON public.user_castle_stamps(user_id);