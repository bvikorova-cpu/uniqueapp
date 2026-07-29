CREATE TABLE IF NOT EXISTS public.ai_public_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_public_profiles TO authenticated;
GRANT SELECT ON public.ai_public_profiles TO anon;
GRANT ALL ON public.ai_public_profiles TO service_role;

ALTER TABLE public.ai_public_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read public profile flags" ON public.ai_public_profiles;
CREATE POLICY "Anyone can read public profile flags"
ON public.ai_public_profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users manage their own public profile flag" ON public.ai_public_profiles;
CREATE POLICY "Users manage their own public profile flag"
ON public.ai_public_profiles FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);