GRANT SELECT ON public.time_reversal_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.time_reversal_posts TO authenticated;
GRANT ALL ON public.time_reversal_posts TO service_role;

GRANT SELECT, INSERT, DELETE ON public.time_reversal_likes TO authenticated;
GRANT ALL ON public.time_reversal_likes TO service_role;

REVOKE ALL ON FUNCTION public.toggle_time_reversal_like(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_time_reversal_like(uuid) TO authenticated, service_role;

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

  IF NOT EXISTS (SELECT 1 FROM public.time_reversal_posts WHERE id = _post_id) THEN
    RAISE EXCEPTION 'post_not_found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.time_reversal_likes
    WHERE post_id = _post_id AND user_id = _uid
  ) THEN
    DELETE FROM public.time_reversal_likes
    WHERE post_id = _post_id AND user_id = _uid;
    _liked := false;
  ELSE
    INSERT INTO public.time_reversal_likes (post_id, user_id)
    VALUES (_post_id, _uid)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    _liked := true;
  END IF;

  SELECT count(*)::integer INTO _count
  FROM public.time_reversal_likes
  WHERE post_id = _post_id;

  UPDATE public.time_reversal_posts
  SET likes_count = _count
  WHERE id = _post_id;

  RETURN jsonb_build_object('liked', _liked, 'likes_count', _count);
END;
$$;