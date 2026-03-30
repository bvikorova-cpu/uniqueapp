-- Brand name suggestions
CREATE TABLE public.brand_name_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL,
  style TEXT NOT NULL,
  keywords TEXT,
  suggestions JSONB NOT NULL DEFAULT '[]',
  credits_used INT NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_name_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own name suggestions" ON public.brand_name_suggestions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Competitor analyses
CREATE TABLE public.brand_competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  competitors JSONB NOT NULL DEFAULT '[]',
  positioning JSONB NOT NULL DEFAULT '{}',
  credits_used INT NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_competitor_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own competitor analyses" ON public.brand_competitor_analyses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Social media kits
CREATE TABLE public.brand_social_media_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  platforms JSONB NOT NULL DEFAULT '{}',
  credits_used INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_social_media_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own social kits" ON public.brand_social_media_kits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);