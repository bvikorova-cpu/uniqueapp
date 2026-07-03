
CREATE TABLE public.healthy_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.healthy_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.healthy_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.healthy_comments TO authenticated;
GRANT ALL ON public.healthy_comments TO service_role;

ALTER TABLE public.healthy_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "healthy_comments_read" ON public.healthy_comments
  FOR SELECT USING (is_deleted = false OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "healthy_comments_insert" ON public.healthy_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "healthy_comments_update_own" ON public.healthy_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "healthy_comments_delete_own" ON public.healthy_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_healthy_comments_submission ON public.healthy_comments(submission_id, created_at);
