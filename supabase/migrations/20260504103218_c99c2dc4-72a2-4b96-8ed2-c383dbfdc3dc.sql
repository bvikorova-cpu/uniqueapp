
CREATE TABLE IF NOT EXISTS public.beauty_celebrity_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_image_url text,
  gender text,
  style text,
  match_result jsonb,
  credits_used integer DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beauty_celebrity_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own celebrity matches" ON public.beauty_celebrity_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own celebrity matches" ON public.beauty_celebrity_matches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.beauty_skin_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skin_type text,
  age text,
  concerns text[],
  current_routine text,
  recommendations jsonb,
  credits_used integer DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beauty_skin_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own skin analyses" ON public.beauty_skin_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own skin analyses" ON public.beauty_skin_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.beauty_nail_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style text,
  occasion text,
  shape text,
  design jsonb,
  credits_used integer DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beauty_nail_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own nail designs" ON public.beauty_nail_designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own nail designs" ON public.beauty_nail_designs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_beauty_celebrity_matches_user ON public.beauty_celebrity_matches(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beauty_skin_analyses_user ON public.beauty_skin_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beauty_nail_designs_user ON public.beauty_nail_designs(user_id, created_at DESC);
