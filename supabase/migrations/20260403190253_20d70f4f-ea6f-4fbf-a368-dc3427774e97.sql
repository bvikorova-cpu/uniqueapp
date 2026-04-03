
-- Glamour World coins
CREATE TABLE public.glamour_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.glamour_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own glamour coins" ON public.glamour_coins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Glamour World creations (houses, outfits, accessories, makeup, nails, rooms, etc.)
CREATE TABLE public.glamour_creations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creation_type TEXT NOT NULL,
  title TEXT,
  prompt TEXT NOT NULL,
  result_text TEXT,
  result_url TEXT,
  credits_used INTEGER NOT NULL DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.glamour_creations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own glamour creations" ON public.glamour_creations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Glamour World pets
CREATE TABLE public.glamour_pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'puppy',
  happiness INTEGER NOT NULL DEFAULT 50,
  style_level INTEGER NOT NULL DEFAULT 1,
  grooming_count INTEGER NOT NULL DEFAULT 0,
  current_outfit TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.glamour_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own glamour pets" ON public.glamour_pets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Glamour World stories
CREATE TABLE public.glamour_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'fairy_tale',
  story_text TEXT,
  cover_url TEXT,
  characters JSONB DEFAULT '[]',
  credits_used INTEGER NOT NULL DEFAULT 4,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.glamour_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own glamour stories" ON public.glamour_stories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_glamour_creations_user ON public.glamour_creations(user_id, creation_type);
CREATE INDEX idx_glamour_stories_user ON public.glamour_stories(user_id);
CREATE INDEX idx_glamour_pets_user ON public.glamour_pets(user_id);
