CREATE TABLE IF NOT EXISTS public.messenger_custom_emojis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL,
  style text NOT NULL DEFAULT 'pixel',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messenger_custom_emojis TO authenticated;
GRANT ALL ON public.messenger_custom_emojis TO service_role;

ALTER TABLE public.messenger_custom_emojis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own custom emojis" ON public.messenger_custom_emojis;
CREATE POLICY "Users manage own custom emojis"
  ON public.messenger_custom_emojis FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messenger_custom_emojis_user ON public.messenger_custom_emojis(user_id, created_at DESC);