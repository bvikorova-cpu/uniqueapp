CREATE OR REPLACE FUNCTION public.publish_premium_video(
  _title text,
  _video_url text,
  _description text DEFAULT NULL,
  _duration_seconds integer DEFAULT NULL,
  _thumbnail_url text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost integer := 1;
  _before integer;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF _title IS NULL OR length(btrim(_title)) = 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'title_required'); END IF;
  IF _video_url IS NULL OR length(btrim(_video_url)) = 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'video_required'); END IF;

  INSERT INTO public.video_credits (user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT credits_remaining INTO _before FROM public.video_credits WHERE user_id = _uid FOR UPDATE;
  IF COALESCE(_before, 0) < _cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(_before, 0), 'cost', _cost);
  END IF;

  UPDATE public.video_credits
     SET credits_remaining = _before - _cost, last_used_at = now(), updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.video_credits_ledger (user_id, delta, balance_before, balance_after, reason, source)
  VALUES (_uid, -_cost, _before, _before - _cost, 'premium_video_upload', 'unlock_videos');

  INSERT INTO public.premium_videos (user_id, title, description, video_url, duration_seconds, thumbnail_url)
  VALUES (_uid, btrim(_title), NULLIF(btrim(COALESCE(_description, '')), ''), _video_url, _duration_seconds, _thumbnail_url)
  RETURNING id INTO _id;

  RETURN jsonb_build_object('ok', true, 'id', _id, 'balance', _before - _cost);
END;
$$;

REVOKE ALL ON FUNCTION public.publish_premium_video(text, text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_premium_video(text, text, text, integer, text) TO authenticated;