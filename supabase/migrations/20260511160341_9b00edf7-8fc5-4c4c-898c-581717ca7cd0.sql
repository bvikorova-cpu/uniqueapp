CREATE TABLE public.iq_public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  share_slug TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_public_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by all"
ON public.iq_public_profiles FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users insert own profile"
ON public.iq_public_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
ON public.iq_public_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own profile"
ON public.iq_public_profiles FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_iq_pub_profiles_slug ON public.iq_public_profiles(share_slug);

CREATE TRIGGER trg_iq_pub_profiles_updated
BEFORE UPDATE ON public.iq_public_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_iq_public_profile(_slug TEXT)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  best_iq INTEGER,
  latest_iq INTEGER,
  total_tests INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  tier TEXT,
  share_slug TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url, p.bio,
         s.best_iq, s.latest_iq, s.total_tests, s.current_streak, s.longest_streak, s.tier,
         p.share_slug
  FROM public.iq_public_profiles p
  LEFT JOIN public.iq_user_stats s ON s.user_id = p.user_id
  WHERE p.share_slug = _slug AND p.is_public = true
  LIMIT 1;
$$;