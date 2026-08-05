CREATE OR REPLACE FUNCTION public.anon_date_request_reveal(_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _updated uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  UPDATE public.anonymous_dating_matches m
  SET reveal_request_at = now(),
      reveal_request_by = _uid,
      updated_at = now()
  WHERE m.id = _match_id
    AND m.status = 'active'
    AND (m.user1_id = _uid OR m.user2_id = _uid)
    AND (m.reveal_request_at IS NULL OR m.reveal_request_at < now() - interval '60 seconds')
  RETURNING m.id INTO _updated;

  IF _updated IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_requested');
  END IF;

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
  _updated uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  UPDATE public.anonymous_dating_matches m
  SET status = 'revealed',
      revealed_at = now(),
      user1_revealed = true,
      user2_revealed = true,
      updated_at = now()
  WHERE m.id = _match_id
    AND m.status = 'active'
    AND (m.user1_id = _uid OR m.user2_id = _uid)
    AND m.reveal_request_by IS NOT NULL
    AND m.reveal_request_by <> _uid
    AND m.reveal_request_at > now() - interval '60 seconds'
  RETURNING m.id INTO _updated;

  IF _updated IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_active_request');
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
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  UPDATE public.anonymous_dating_matches m
  SET reveal_request_at = NULL,
      reveal_request_by = NULL,
      updated_at = now()
  WHERE m.id = _match_id
    AND m.reveal_request_by = _uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.anon_date_request_reveal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anon_date_accept_reveal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anon_date_cancel_reveal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anon_date_request_reveal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anon_date_accept_reveal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anon_date_cancel_reveal(uuid) TO authenticated;