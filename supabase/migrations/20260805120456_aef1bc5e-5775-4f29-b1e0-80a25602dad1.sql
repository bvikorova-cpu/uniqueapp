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

  IF _uid = _match.user1_id THEN
    UPDATE public.anonymous_dating_matches
    SET reveal_request_at = now(),
        reveal_request_by = _uid,
        user1_revealed = true,
        updated_at = now()
    WHERE id = _match_id;
  ELSE
    UPDATE public.anonymous_dating_matches
    SET reveal_request_at = now(),
        reveal_request_by = _uid,
        user2_revealed = true,
        updated_at = now()
    WHERE id = _match_id;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.anon_date_cancel_reveal(_match_id uuid)
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
    AND reveal_request_by = _uid
    AND (user1_id = _uid OR user2_id = _uid)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF _uid = _match.user1_id THEN
    UPDATE public.anonymous_dating_matches
    SET reveal_request_at = NULL,
        reveal_request_by = NULL,
        user1_revealed = false,
        updated_at = now()
    WHERE id = _match_id;
  ELSE
    UPDATE public.anonymous_dating_matches
    SET reveal_request_at = NULL,
        reveal_request_by = NULL,
        user2_revealed = false,
        updated_at = now()
    WHERE id = _match_id;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.anon_date_request_reveal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anon_date_cancel_reveal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anon_date_request_reveal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anon_date_cancel_reveal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anon_date_request_reveal(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.anon_date_cancel_reveal(uuid) TO service_role;

NOTIFY pgrst, 'reload schema';