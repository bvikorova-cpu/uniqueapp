CREATE OR REPLACE FUNCTION public.anon_date_send_gift(_match_id uuid, _gift text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _partner uuid;
  _cost int := 10;
  _bal int;
  _msg_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;
  IF _gift IS NULL OR length(btrim(_gift)) = 0 OR length(_gift) > 40 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_GIFT');
  END IF;

  SELECT CASE WHEN user1_id = _uid THEN user2_id ELSE user1_id END
    INTO _partner
  FROM public.anonymous_dating_matches
  WHERE id = _match_id AND (user1_id = _uid OR user2_id = _uid);

  IF _partner IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'MATCH_NOT_FOUND');
  END IF;

  UPDATE public.ai_credits
     SET credits_remaining = credits_remaining - _cost
   WHERE user_id = _uid AND credits_remaining >= _cost
  RETURNING credits_remaining INTO _bal;

  IF _bal IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS');
  END IF;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor)
  VALUES (_uid, -_cost, _bal + _cost, _bal, 'anonymous_date_gift', 'anonymous_date', _uid);

  INSERT INTO public.anonymous_dating_messages (match_id, sender_id, content, message_type, is_read)
  VALUES (_match_id, _uid, _gift, 'gift', false)
  RETURNING id INTO _msg_id;

  PERFORM public.send_user_notification(
    _partner,
    'anonymous_date_gift',
    'You received a gift ' || _gift,
    'Your anonymous match sent you a virtual gift.',
    _match_id,
    '/anonymous-date'
  );

  RETURN jsonb_build_object('success', true, 'message_id', _msg_id, 'credits_remaining', _bal);
END;
$$;

REVOKE ALL ON FUNCTION public.anon_date_send_gift(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.anon_date_send_gift(uuid, text) TO authenticated;