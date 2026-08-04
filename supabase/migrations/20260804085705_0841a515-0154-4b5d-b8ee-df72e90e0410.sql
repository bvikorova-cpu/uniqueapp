CREATE TABLE IF NOT EXISTS public.holographic_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  traits TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.holographic_avatars TO authenticated;
GRANT ALL ON public.holographic_avatars TO service_role;
ALTER TABLE public.holographic_avatars ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage their own holographic avatars" ON public.holographic_avatars
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS holographic_avatars_user_idx ON public.holographic_avatars(user_id, created_at DESC);