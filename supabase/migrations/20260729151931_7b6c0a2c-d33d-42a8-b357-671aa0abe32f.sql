CREATE TABLE IF NOT EXISTS public.ai_studio_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_studio_folders TO authenticated;
GRANT ALL ON public.ai_studio_folders TO service_role;
ALTER TABLE public.ai_studio_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own ai studio folders" ON public.ai_studio_folders;
CREATE POLICY "Users manage own ai studio folders" ON public.ai_studio_folders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_studio_folders_user ON public.ai_studio_folders(user_id, created_at DESC);