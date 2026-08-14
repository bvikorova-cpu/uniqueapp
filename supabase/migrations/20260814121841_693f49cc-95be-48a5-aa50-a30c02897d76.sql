CREATE TABLE public.influencer_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.influencer_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT influencer_post_comments_content_length CHECK (char_length(content) BETWEEN 1 AND 1000)
);

GRANT SELECT, INSERT, DELETE ON public.influencer_post_comments TO authenticated;
GRANT ALL ON public.influencer_post_comments TO service_role;

ALTER TABLE public.influencer_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view influencer comments"
ON public.influencer_post_comments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create their own influencer comments"
ON public.influencer_post_comments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own influencer comments"
ON public.influencer_post_comments
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX influencer_post_comments_post_created_idx
ON public.influencer_post_comments (post_id, created_at);

CREATE TRIGGER update_influencer_post_comments_updated_at
BEFORE UPDATE ON public.influencer_post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();