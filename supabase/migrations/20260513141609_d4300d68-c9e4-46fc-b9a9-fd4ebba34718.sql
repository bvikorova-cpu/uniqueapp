-- 1) user_notes — 24h ephemeral status
CREATE TABLE IF NOT EXISTS public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 280),
  emoji text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_expires ON public.user_notes(expires_at);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes viewable by authenticated users while active"
  ON public.user_notes FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users insert own notes"
  ON public.user_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notes"
  ON public.user_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notes"
  ON public.user_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2) user_muted_keywords
CREATE TABLE IF NOT EXISTS public.user_muted_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  keyword text NOT NULL CHECK (char_length(keyword) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, keyword)
);

CREATE INDEX IF NOT EXISTS idx_user_muted_keywords_user ON public.user_muted_keywords(user_id);

ALTER TABLE public.user_muted_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own muted keywords"
  ON public.user_muted_keywords FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own muted keywords"
  ON public.user_muted_keywords FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own muted keywords"
  ON public.user_muted_keywords FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3) posts: sensitive content flags
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_sensitive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sensitive_reason text;