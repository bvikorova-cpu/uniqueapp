-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own collectibles" ON public.user_collectibles;
DROP POLICY IF EXISTS "Users can insert their own collectibles" ON public.user_collectibles;

-- Create table for collectible items
CREATE TABLE IF NOT EXISTS public.disney_collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  category TEXT CHECK (category IN ('character', 'magical_object', 'treasure', 'special')) DEFAULT 'magical_object',
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for castle room collectibles
CREATE TABLE IF NOT EXISTS public.castle_room_collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.disney_castle_rooms(id) ON DELETE CASCADE,
  collectible_id UUID NOT NULL REFERENCES public.disney_collectibles(id) ON DELETE CASCADE,
  position_x DECIMAL(5,2) NOT NULL,
  position_y DECIMAL(5,2) NOT NULL,
  position_z DECIMAL(5,2) DEFAULT 500,
  hint_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, collectible_id)
);

-- Create table for user's collected items
CREATE TABLE IF NOT EXISTS public.user_collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collectible_id UUID NOT NULL REFERENCES public.disney_collectibles(id) ON DELETE CASCADE,
  castle_id UUID NOT NULL REFERENCES public.disney_castles(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.disney_castle_rooms(id) ON DELETE CASCADE,
  found_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, collectible_id)
);

-- Enable RLS
ALTER TABLE public.disney_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.castle_room_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view collectibles"
  ON public.disney_collectibles
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view room collectibles"
  ON public.castle_room_collectibles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own collectibles"
  ON public.user_collectibles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collectibles"
  ON public.user_collectibles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);