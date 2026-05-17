
-- Brand Voice profiles
CREATE TABLE public.creative_forge_brand_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT,
  audience TEXT,
  do_use TEXT,
  dont_use TEXT,
  sample_text TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creative_forge_brand_voices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own brand voices" ON public.creative_forge_brand_voices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_cf_brand_voices_user ON public.creative_forge_brand_voices(user_id);

-- Story Bible entries (characters, places, plot, lore)
CREATE TABLE public.creative_forge_story_bible (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('character','place','plot','lore','object','timeline')),
  name TEXT NOT NULL,
  summary TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creative_forge_story_bible ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bible" ON public.creative_forge_story_bible FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_cf_bible_user ON public.creative_forge_story_bible(user_id);
CREATE INDEX idx_cf_bible_project ON public.creative_forge_story_bible(project_id);

-- Content scores (quality / readability / emotion / SEO / plagiarism)
CREATE TABLE public.creative_forge_content_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  score_type TEXT NOT NULL CHECK (score_type IN ('quality','seo','plagiarism','readability','emotion')),
  overall_score NUMERIC(5,2),
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggestions TEXT[] NOT NULL DEFAULT '{}',
  source_excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creative_forge_content_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scores" ON public.creative_forge_content_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_cf_scores_user ON public.creative_forge_content_scores(user_id);

-- updated_at trigger reuse
CREATE TRIGGER cf_brand_voices_updated BEFORE UPDATE ON public.creative_forge_brand_voices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cf_bible_updated BEFORE UPDATE ON public.creative_forge_story_bible FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
