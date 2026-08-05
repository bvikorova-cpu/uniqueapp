
CREATE OR REPLACE FUNCTION public.dating_match_first_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.dating_matches
     SET first_message_at = COALESCE(first_message_at, now()),
         expires_at = NULL
   WHERE id = NEW.match_id AND first_message_at IS NULL;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_dating_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE other uuid;
BEGIN
  SELECT CASE WHEN user1_id = NEW.sender_id THEN user2_id ELSE user1_id END INTO other
  FROM public.dating_matches WHERE id = NEW.match_id;
  IF other IS NOT NULL THEN
    BEGIN
      PERFORM public.push_notification(other, NEW.sender_id, 'dating_message', 'New dating message',
        'You received a new message', '/dating', NEW.match_id, NULL);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

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
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT CASE WHEN user1_id = v_user THEN user2_id ELSE user1_id END
  INTO v_receiver
  FROM public.dating_matches
  WHERE id = _match_id AND (user1_id = v_user OR user2_id = v_user);

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
  VALUES (v_user, v_receiver, _gift_id, _match_id, NULLIF(_message, ''), 'completed', v_cost);

  BEGIN
    PERFORM public.send_user_notification(v_receiver, 'dating_gift', 'You received a gift ' || v_icon,
      'Someone sent you ' || v_name, _match_id, '/dating');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN jsonb_build_object('success', true, 'credits_spent', v_cost, 'gift_id', _gift_id);
END;
$$;
