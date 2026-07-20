
CREATE TABLE public.exclusive_feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('off_market','pre_ipo','culture','intel','event','other')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 5000),
  link_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_feed_posts TO authenticated;
GRANT ALL ON public.exclusive_feed_posts TO service_role;

ALTER TABLE public.exclusive_feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read feed"
ON public.exclusive_feed_posts FOR SELECT
TO authenticated
USING (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert feed"
ON public.exclusive_feed_posts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND author_id = auth.uid());

CREATE POLICY "Admins can update feed"
ON public.exclusive_feed_posts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feed"
ON public.exclusive_feed_posts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_feed_posts_published ON public.exclusive_feed_posts (is_pinned DESC, published_at DESC);

CREATE TABLE public.exclusive_feed_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.exclusive_feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('seen','starred')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, kind)
);

GRANT SELECT, INSERT, DELETE ON public.exclusive_feed_reactions TO authenticated;
GRANT ALL ON public.exclusive_feed_reactions TO service_role;

ALTER TABLE public.exclusive_feed_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own reactions"
ON public.exclusive_feed_reactions FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND public.is_exclusive_member(auth.uid()));

CREATE POLICY "Members insert own reactions"
ON public.exclusive_feed_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_exclusive_member(auth.uid()));

CREATE POLICY "Members delete own reactions"
ON public.exclusive_feed_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE INDEX idx_feed_reactions_post ON public.exclusive_feed_reactions (post_id);

CREATE TRIGGER trg_feed_posts_updated_at
BEFORE UPDATE ON public.exclusive_feed_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
