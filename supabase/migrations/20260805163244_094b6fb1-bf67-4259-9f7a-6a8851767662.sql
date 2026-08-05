
ALTER TABLE public.dating_gifts ADD COLUMN IF NOT EXISTS credit_cost integer;
UPDATE public.dating_gifts SET credit_cost = GREATEST(1, CEIL(price * 2)::int) WHERE credit_cost IS NULL;
ALTER TABLE public.dating_gifts ALTER COLUMN credit_cost SET NOT NULL;

CREATE OR REPLACE FUNCTION public.dating_send_gift_credits(_match_id uuid, _gift_id uuid, _message text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_receiver uuid;
  v_cost int;
  v_name text;
  v_icon text;
  v_ok boolean;
  v_row public.dating_sent_gifts;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT CASE WHEN user_id = v_user THEN matched_user_id ELSE user_id END
  INTO v_receiver
  FROM public.dating_matches
  WHERE id = _match_id AND (user_id = v_user OR matched_user_id = v_user);

  IF v_receiver IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;

  SELECT credit_cost, name, icon INTO v_cost, v_name, v_icon FROM public.dating_gifts WHERE id = _gift_id;
  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift not found');
  END IF;

  SELECT public.deduct_ai_credits(v_user, v_cost, 'Dating gift: ' || v_name, 'dating_gift') INTO v_ok;
  IF NOT COALESCE(v_ok, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough credits', 'needed', v_cost);
  END IF;

  INSERT INTO public.dating_sent_gifts (sender_id, receiver_id, gift_id, match_id, message, status, amount)
  VALUES (v_user, v_receiver, _gift_id, _match_id, NULLIF(_message, ''), 'completed', v_cost)
  RETURNING * INTO v_row;

  PERFORM public.send_user_notification(v_receiver, 'dating_gift', 'You received a gift ' || v_icon,
    'Someone sent you ' || v_name, _match_id, '/dating');

  RETURN jsonb_build_object('success', true, 'credits_spent', v_cost, 'gift_id', _gift_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.dating_send_gift_credits(uuid, uuid, text) TO authenticated;
