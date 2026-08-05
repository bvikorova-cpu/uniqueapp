CREATE TABLE IF NOT EXISTS public.messenger_chat_themes (
  user_id UUID NOT NULL PRIMARY KEY,
  theme_id TEXT NOT NULL DEFAULT 'midnight',
  wallpaper_id TEXT NOT NULL DEFAULT 'abstract',
  owned_themes TEXT[] NOT NULL DEFAULT '{}',
  custom_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messenger_chat_themes TO authenticated;
GRANT ALL ON public.messenger_chat_themes TO service_role;

ALTER TABLE public.messenger_chat_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own chat theme" ON public.messenger_chat_themes;
CREATE POLICY "Users manage own chat theme" ON public.messenger_chat_themes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER messenger_chat_themes_updated_at
  BEFORE UPDATE ON public.messenger_chat_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();