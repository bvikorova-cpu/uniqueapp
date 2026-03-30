CREATE TABLE public.home_color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_image_url TEXT NOT NULL,
  palette JSONB NOT NULL DEFAULT '[]',
  room_type TEXT,
  mood TEXT,
  credits_used INT DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.home_color_palettes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own palettes" ON public.home_color_palettes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.home_furniture_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_image_url TEXT NOT NULL,
  room_type TEXT,
  style TEXT,
  budget TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]',
  credits_used INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.home_furniture_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own furniture recs" ON public.home_furniture_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.home_virtual_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  staged_image_url TEXT,
  room_type TEXT,
  staging_style TEXT,
  property_type TEXT,
  credits_used INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.home_virtual_staging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own staging" ON public.home_virtual_staging FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.home_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  room_type TEXT,
  style TEXT,
  likes_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.home_transformations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public transformations" ON public.home_transformations FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own transformations" ON public.home_transformations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own transformations" ON public.home_transformations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own transformations" ON public.home_transformations FOR DELETE USING (auth.uid() = user_id);