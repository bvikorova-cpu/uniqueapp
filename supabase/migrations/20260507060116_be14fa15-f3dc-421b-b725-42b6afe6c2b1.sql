
-- Likes for emotion posts
CREATE TABLE IF NOT EXISTS public.emotion_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.emotion_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.emotion_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select_all" ON public.emotion_post_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON public.emotion_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON public.emotion_post_likes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_post_likes_post ON public.emotion_post_likes(post_id);

-- Trigger to maintain likes_count
CREATE OR REPLACE FUNCTION public.update_emotion_post_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.emotion_posts SET likes_count = COALESCE(likes_count,0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.emotion_posts SET likes_count = GREATEST(COALESCE(likes_count,0) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_emotion_post_likes_count ON public.emotion_post_likes;
CREATE TRIGGER trg_emotion_post_likes_count
AFTER INSERT OR DELETE ON public.emotion_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_emotion_post_likes_count();

-- Notify me for emotion drops
CREATE TABLE IF NOT EXISTS public.emotion_drop_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  drop_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, drop_key)
);
ALTER TABLE public.emotion_drop_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notify_select_own" ON public.emotion_drop_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notify_insert_own" ON public.emotion_drop_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notify_delete_own" ON public.emotion_drop_notifications FOR DELETE USING (auth.uid() = user_id);
