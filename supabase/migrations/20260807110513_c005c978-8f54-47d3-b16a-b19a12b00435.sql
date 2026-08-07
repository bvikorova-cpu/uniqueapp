-- ============ Fairytale Book Generator ============
CREATE TABLE IF NOT EXISTS public.fairytale_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  theme TEXT,
  style TEXT,
  title TEXT,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fairytale_books TO authenticated;
GRANT ALL ON public.fairytale_books TO service_role;
ALTER TABLE public.fairytale_books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own fairytale books" ON public.fairytale_books;
CREATE POLICY "own fairytale books" ON public.fairytale_books FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_fairytale_books_user ON public.fairytale_books(user_id, created_at DESC);

-- ============ Guess My Age ============
CREATE TABLE IF NOT EXISTS public.guess_age_profiles (
  user_id UUID NOT NULL PRIMARY KEY,
  real_age INT NOT NULL CHECK (real_age BETWEEN 13 AND 120),
  photo_path TEXT NOT NULL,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guess_age_profiles TO authenticated;
GRANT ALL ON public.guess_age_profiles TO service_role;
ALTER TABLE public.guess_age_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own guess age profile" ON public.guess_age_profiles;
CREATE POLICY "own guess age profile" ON public.guess_age_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.guess_age_guesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL,
  guesser_id UUID NOT NULL,
  guessed_age INT NOT NULL CHECK (guessed_age BETWEEN 1 AND 120),
  real_age INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_user_id, guesser_id)
);
GRANT SELECT ON public.guess_age_guesses TO authenticated;
GRANT ALL ON public.guess_age_guesses TO service_role;
ALTER TABLE public.guess_age_guesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own guess age guesses" ON public.guess_age_guesses;
CREATE POLICY "read own guess age guesses" ON public.guess_age_guesses FOR SELECT TO authenticated
  USING (guesser_id = auth.uid() OR profile_user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_guess_age_guesses_guesser ON public.guess_age_guesses(guesser_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guess_age_guesses_profile ON public.guess_age_guesses(profile_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.guess_age_scores (
  user_id UUID NOT NULL PRIMARY KEY,
  points INT NOT NULL DEFAULT 0,
  correct_guesses INT NOT NULL DEFAULT 0,
  total_guesses INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guess_age_scores TO authenticated;
GRANT ALL ON public.guess_age_scores TO service_role;
ALTER TABLE public.guess_age_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read guess age scores" ON public.guess_age_scores;
CREATE POLICY "read guess age scores" ON public.guess_age_scores FOR SELECT TO authenticated USING (true);

-- Storage policies: users manage only their own folder in the private bucket
DROP POLICY IF EXISTS "guess age photos own read" ON storage.objects;
CREATE POLICY "guess age photos own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'guess-age-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "guess age photos own insert" ON storage.objects;
CREATE POLICY "guess age photos own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'guess-age-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "guess age photos own update" ON storage.objects;
CREATE POLICY "guess age photos own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'guess-age-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "guess age photos own delete" ON storage.objects;
CREATE POLICY "guess age photos own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'guess-age-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.get_guess_age_leaderboard(_limit INT DEFAULT 20)
RETURNS TABLE (user_id UUID, points INT, correct_guesses INT, total_guesses INT, display_name TEXT, avatar_url TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id, s.points, s.correct_guesses, s.total_guesses,
         COALESCE(pr.full_name, pr.username, 'Player')::TEXT, pr.avatar_url
  FROM public.guess_age_scores s
  LEFT JOIN public.profiles pr ON pr.id = s.user_id
  ORDER BY s.points DESC, s.correct_guesses DESC
  LIMIT GREATEST(1, LEAST(COALESCE(_limit, 20), 50));
$$;
GRANT EXECUTE ON FUNCTION public.get_guess_age_leaderboard(INT) TO authenticated;

DROP TRIGGER IF EXISTS trg_fairytale_books_updated_at ON public.fairytale_books;
CREATE TRIGGER trg_fairytale_books_updated_at BEFORE UPDATE ON public.fairytale_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_guess_age_profiles_updated_at ON public.guess_age_profiles;
CREATE TRIGGER trg_guess_age_profiles_updated_at BEFORE UPDATE ON public.guess_age_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();