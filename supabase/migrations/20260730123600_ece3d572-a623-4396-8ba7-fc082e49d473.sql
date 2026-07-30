CREATE TABLE public.pet_social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_name TEXT NOT NULL,
  species TEXT,
  mood TEXT,
  caption TEXT,
  photo_url TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pet_social_posts TO authenticated;
GRANT ALL ON public.pet_social_posts TO service_role;
ALTER TABLE public.pet_social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pet_social_posts_select" ON public.pet_social_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "pet_social_posts_insert" ON public.pet_social_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pet_social_posts_update" ON public.pet_social_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pet_social_posts_delete" ON public.pet_social_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.pet_social_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.pet_social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.pet_social_likes TO authenticated;
GRANT ALL ON public.pet_social_likes TO service_role;
ALTER TABLE public.pet_social_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pet_social_likes_select" ON public.pet_social_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "pet_social_likes_insert" ON public.pet_social_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pet_social_likes_delete" ON public.pet_social_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.pet_social_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.pet_social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.pet_social_comments TO authenticated;
GRANT ALL ON public.pet_social_comments TO service_role;
ALTER TABLE public.pet_social_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pet_social_comments_select" ON public.pet_social_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "pet_social_comments_insert" ON public.pet_social_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pet_social_comments_delete" ON public.pet_social_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_pet_social_posts_created ON public.pet_social_posts (created_at DESC);
CREATE INDEX idx_pet_social_comments_post ON public.pet_social_comments (post_id, created_at);

CREATE OR REPLACE FUNCTION public.pet_social_bump_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pet_social_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSE
    UPDATE public.pet_social_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;
CREATE TRIGGER trg_pet_social_likes
AFTER INSERT OR DELETE ON public.pet_social_likes
FOR EACH ROW EXECUTE FUNCTION public.pet_social_bump_likes();

CREATE OR REPLACE FUNCTION public.pet_social_bump_comments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pet_social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSE
    UPDATE public.pet_social_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;
CREATE TRIGGER trg_pet_social_comments
AFTER INSERT OR DELETE ON public.pet_social_comments
FOR EACH ROW EXECUTE FUNCTION public.pet_social_bump_comments();