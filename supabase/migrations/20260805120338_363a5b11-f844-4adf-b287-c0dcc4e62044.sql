CREATE OR REPLACE FUNCTION public.anon_date_request_reveal(_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _match public.anonymous_dating_matches%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT * INTO _match
  FROM public.anonymous_dating_matches
  WHERE id = _match_id
    AND status = 'active'
    AND (user1_id = _uid OR user2_id = _uid)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF _match.reveal_request_at IS NOT NULL
     AND _match.reveal_request_at >= now() - interval '60 seconds' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_requested');
  END IF;

  UPDATE public.anonymous_dating_matches
  SET reveal_request_at = now(),
      reveal_request_by = _uid,
      user1_revealed = CASE WHEN user1_id = _uid THEN true ELSE false END,
      user2_revealed = CASE WHEN user2_id = _uid THEN true ELSE false END,
      updated_at = now()
  WHERE id = _match_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.anon_date_accept_reveal(_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _match public.anonymous_dating_matches%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT * INTO _match
  FROM public.anonymous_dating_matches
  WHERE id = _match_id
    AND status = 'active'
    AND (user1_id = _uid OR user2_id = _uid)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF _match.reveal_request_by IS NULL
     OR _match.reveal_request_by = _uid
     OR _match.reveal_request_at IS NULL
     OR _match.reveal_request_at <= now() - interval '60 seconds' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_active_request');
  END IF;

  IF _uid = _match.user1_id THEN
    UPDATE public.anonymous_dating_matches
    SET user1_revealed = true,
        status = CASE WHEN user2_revealed THEN 'revealed' ELSE status END,
        revealed_at = CASE WHEN user2_revealed THEN now() ELSE revealed_at END,
        updated_at = now()
    WHERE id = _match_id;
  ELSE
    UPDATE public.anonymous_dating_matches
    SET user2_revealed = true,
        status = CASE WHEN user1_revealed THEN 'revealed' ELSE status END,
        revealed_at = CASE WHEN user1_revealed THEN now() ELSE revealed_at END,
        updated_at = now()
    WHERE id = _match_id;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.anon_date_request_reveal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anon_date_accept_reveal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anon_date_request_reveal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anon_date_accept_reveal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anon_date_request_reveal(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.anon_date_accept_reveal(uuid) TO service_role;

NOTIFY pgrst, 'reload schema';