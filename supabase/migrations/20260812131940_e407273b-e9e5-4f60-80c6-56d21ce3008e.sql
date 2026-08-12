CREATE TABLE public.shadow_story_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.shadow_stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shadow_story_comments TO authenticated;
GRANT ALL ON public.shadow_story_comments TO service_role;

ALTER TABLE public.shadow_story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read story comments"
ON public.shadow_story_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add own story comments"
ON public.shadow_story_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story comments"
ON public.shadow_story_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own story comments"
ON public.shadow_story_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_shadow_story_comments_story ON public.shadow_story_comments(story_id, created_at DESC);