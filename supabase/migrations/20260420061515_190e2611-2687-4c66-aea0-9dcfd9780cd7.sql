
-- 1. Add username (slug) + a few new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS personality_traits JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tone_of_voice TEXT,
  ADD COLUMN IF NOT EXISTS animated_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS animated_avatar_audio_url TEXT;

-- Unique case-insensitive username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;

-- 2. Profile views (analytics)
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  viewer_id UUID,
  viewer_country TEXT,
  viewer_city TEXT,
  viewer_user_agent TEXT,
  referrer TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_views_profile_idx ON public.profile_views(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS profile_views_viewer_idx  ON public.profile_views(viewer_id);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert a profile view" ON public.profile_views;
CREATE POLICY "Anyone can insert a profile view"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owner can view their profile views" ON public.profile_views;
CREATE POLICY "Owner can view their profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = profile_id);

-- 3. Profile personality test results
CREATE TABLE IF NOT EXISTS public.profile_personality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  archetype TEXT,
  traits JSONB DEFAULT '{}'::jsonb,
  suggested_interests TEXT[] DEFAULT '{}'::text[],
  suggested_tone TEXT,
  raw_answers JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_personality ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User reads own personality" ON public.profile_personality;
CREATE POLICY "User reads own personality"
  ON public.profile_personality FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User writes own personality" ON public.profile_personality;
CREATE POLICY "User writes own personality"
  ON public.profile_personality FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User updates own personality" ON public.profile_personality;
CREATE POLICY "User updates own personality"
  ON public.profile_personality FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Storage bucket for animated avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('animated-avatars','animated-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for animated-avatars
DROP POLICY IF EXISTS "Animated avatars publicly readable" ON storage.objects;
CREATE POLICY "Animated avatars publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animated-avatars');

DROP POLICY IF EXISTS "Users upload own animated avatars" ON storage.objects;
CREATE POLICY "Users upload own animated avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'animated-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users update own animated avatars" ON storage.objects;
CREATE POLICY "Users update own animated avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'animated-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Make sure 'covers' bucket exists & is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers','covers', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Public read on profile_voice_intros (so visitors can hear it)
ALTER TABLE public.profile_voice_intros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voice intros publicly readable" ON public.profile_voice_intros;
CREATE POLICY "Voice intros publicly readable"
  ON public.profile_voice_intros FOR SELECT
  USING (true);

-- 7. updated_at trigger reuse
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS profile_personality_touch ON public.profile_personality;
CREATE TRIGGER profile_personality_touch
  BEFORE UPDATE ON public.profile_personality
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
