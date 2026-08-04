-- Grants (were missing entirely, so the Data API could not read the feed)
GRANT SELECT ON public.time_reversal_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_reversal_posts TO authenticated;
GRANT ALL ON public.time_reversal_posts TO service_role;

GRANT SELECT ON public.time_reversal_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_reversal_profiles TO authenticated;
GRANT ALL ON public.time_reversal_profiles TO service_role;

GRANT SELECT ON public.time_reversal_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.time_reversal_likes TO authenticated;
GRANT ALL ON public.time_reversal_likes TO service_role;

GRANT SELECT ON public.time_reversal_followers TO anon;
GRANT SELECT, INSERT, DELETE ON public.time_reversal_followers TO authenticated;
GRANT ALL ON public.time_reversal_followers TO service_role;

ALTER TABLE public.time_reversal_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_reversal_followers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_reversal_likes' AND policyname='Likes are viewable by everyone') THEN
    CREATE POLICY "Likes are viewable by everyone" ON public.time_reversal_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_reversal_likes' AND policyname='Users can like posts') THEN
    CREATE POLICY "Users can like posts" ON public.time_reversal_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_reversal_likes' AND policyname='Users can remove their own likes') THEN
    CREATE POLICY "Users can remove their own likes" ON public.time_reversal_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_reversal_followers' AND policyname='Followers are viewable by everyone') THEN
    CREATE POLICY "Followers are viewable by everyone" ON public.time_reversal_followers FOR SELECT USING (true);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS time_reversal_likes_unique ON public.time_reversal_likes (post_id, user_id);
CREATE INDEX IF NOT EXISTS time_reversal_posts_created_idx ON public.time_reversal_posts (created_at DESC);

CREATE OR REPLACE FUNCTION public.toggle_time_reversal_like(_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _liked boolean;
  _count integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.time_reversal_likes WHERE post_id = _post_id AND user_id = _uid) THEN
    DELETE FROM public.time_reversal_likes WHERE post_id = _post_id AND user_id = _uid;
    _liked := false;
  ELSE
    INSERT INTO public.time_reversal_likes (post_id, user_id) VALUES (_post_id, _uid)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    _liked := true;
  END IF;

  SELECT count(*) INTO _count FROM public.time_reversal_likes WHERE post_id = _post_id;
  UPDATE public.time_reversal_posts SET likes_count = _count WHERE id = _post_id;

  RETURN jsonb_build_object('liked', _liked, 'likes_count', _count);
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_time_reversal_like(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_time_reversal_like(uuid) TO authenticated;