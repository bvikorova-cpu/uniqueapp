
CREATE TABLE IF NOT EXISTS public.module_course_content_cache (
  course_key text PRIMARY KEY,
  module_key text NOT NULL,
  course_slug text NOT NULL,
  course_title text NOT NULL,
  content jsonb NOT NULL,
  quiz_pool jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.module_course_content_cache TO anon, authenticated;
GRANT ALL ON public.module_course_content_cache TO service_role;
ALTER TABLE public.module_course_content_cache ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='module_course_content_cache' AND policyname='public read course content cache') THEN
    CREATE POLICY "public read course content cache" ON public.module_course_content_cache FOR SELECT USING (true);
  END IF;
END $$;
