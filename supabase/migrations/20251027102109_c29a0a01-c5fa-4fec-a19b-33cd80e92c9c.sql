-- Add new collectible types and evolution system

-- Add evolution tracking for pets
CREATE TABLE IF NOT EXISTS public.collectible_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collectible_id UUID NOT NULL REFERENCES public.user_collectibles(id) ON DELETE CASCADE,
  evolution_level INTEGER NOT NULL DEFAULT 1,
  evolution_points INTEGER NOT NULL DEFAULT 0,
  points_to_next_level INTEGER NOT NULL DEFAULT 100,
  can_evolve_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add achievements/badges system
CREATE TABLE IF NOT EXISTS public.collectible_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('task', 'seasonal', 'community')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  points_reward INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track user achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.collectible_achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Add more detailed properties to collectibles
ALTER TABLE public.user_collectibles 
ADD COLUMN IF NOT EXISTS collectible_type TEXT DEFAULT 'card' CHECK (collectible_type IN ('pet', 'artifact', 'card', 'badge')),
ADD COLUMN IF NOT EXISTS properties JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_tradeable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_evolved BOOLEAN DEFAULT false;

-- Insert new categories only if they don't exist
DO $$ 
BEGIN
  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Pets - Dogs', 'Adorable virtual dogs with unique traits'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Pets - Dogs');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Pets - Cats', 'Mystical virtual cats with magical abilities'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Pets - Cats');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Pets - Exotic', 'Rare and exotic virtual creatures'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Pets - Exotic');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Artifacts - Historical', 'Ancient artifacts from world history'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Artifacts - Historical');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Artifacts - Sci-Fi', 'Futuristic technological marvels'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Artifacts - Sci-Fi');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Artifacts - Magical', 'Enchanted items with mystical powers'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Artifacts - Magical');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Cards - Sports Stars', 'Legendary athletes and sports heroes'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Cards - Sports Stars');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Cards - Fantasy', 'Epic fantasy characters and creatures'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Cards - Fantasy');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Cards - Art', 'Masterpiece artworks and famous pieces'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Cards - Art');

  INSERT INTO public.collectible_categories (name, description) 
  SELECT 'Cards - Pop Culture', 'Iconic figures from movies, music, and media'
  WHERE NOT EXISTS (SELECT 1 FROM public.collectible_categories WHERE name = 'Cards - Pop Culture');
END $$;

-- Insert achievement examples  
INSERT INTO public.collectible_achievements (name, description, category, requirement_type, requirement_value, points_reward) 
VALUES
('First Collection', 'Generate your first collectible', 'task', 'generate_count', 1, 10),
('Collector Pro', 'Own 50 collectibles', 'task', 'total_owned', 50, 50),
('Mystery Master', 'Open 10 mystery boxes', 'task', 'boxes_opened', 10, 30),
('Rare Hunter', 'Collect 5 rare items', 'task', 'rare_count', 5, 40),
('Evolution Expert', 'Evolve a pet to max level', 'task', 'max_evolution', 1, 100),
('Spring Event 2025', 'Participate in Spring 2025 event', 'seasonal', 'event_participation', 1, 20),
('Community Champion', 'Trade with 10 different users', 'community', 'trade_count', 10, 60)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.collectible_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collectible_evolution
CREATE POLICY "Users can view their own evolution data"
  ON public.collectible_evolution FOR SELECT
  USING (
    collectible_id IN (
      SELECT id FROM public.user_collectibles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own evolution data"
  ON public.collectible_evolution FOR UPDATE
  USING (
    collectible_id IN (
      SELECT id FROM public.user_collectibles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON public.collectible_achievements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own unlocked achievements"
  ON public.user_achievements FOR SELECT
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collectible_evolution_collectible ON public.collectible_evolution(collectible_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_collectibles_type ON public.user_collectibles(collectible_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_collectible_evolution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_collectible_evolution_timestamp ON public.collectible_evolution;
CREATE TRIGGER update_collectible_evolution_timestamp
  BEFORE UPDATE ON public.collectible_evolution
  FOR EACH ROW
  EXECUTE FUNCTION update_collectible_evolution_timestamp();