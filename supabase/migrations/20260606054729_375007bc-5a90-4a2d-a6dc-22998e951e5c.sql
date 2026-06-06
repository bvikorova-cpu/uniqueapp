
-- Phase 2: Hinge-killer profile fields
ALTER TABLE public.dating_profiles
  ADD COLUMN IF NOT EXISTS prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS voice_intro_url TEXT,
  ADD COLUMN IF NOT EXISTS voice_intro_duration INTEGER,
  ADD COLUMN IF NOT EXISTS spotify_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ;

-- Photo-specific likes (Hinge style)
CREATE TABLE IF NOT EXISTS public.dating_photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  prompt_index INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id, photo_url)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_photo_likes TO authenticated;
GRANT ALL ON public.dating_photo_likes TO service_role;

ALTER TABLE public.dating_photo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see photo likes they sent or received"
  ON public.dating_photo_likes FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users send their own photo likes"
  ON public.dating_photo_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users delete their own photo likes"
  ON public.dating_photo_likes FOR DELETE TO authenticated
  USING (auth.uid() = from_user_id);

CREATE INDEX IF NOT EXISTS idx_dating_photo_likes_to ON public.dating_photo_likes(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dating_photo_likes_from ON public.dating_photo_likes(from_user_id);
