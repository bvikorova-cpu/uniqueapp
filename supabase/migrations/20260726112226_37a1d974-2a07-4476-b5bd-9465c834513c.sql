CREATE OR REPLACE FUNCTION public.gift_ai_credits_by_identifier(p_recipient text, p_amount integer, p_message text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sender UUID := auth.uid();
  v_recipient UUID;
  v_recipient_label TEXT;
  v_sender_label TEXT;
  v_input TEXT := trim(p_recipient);
  v_match_count INT;
BEGIN
  IF v_sender IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount IS NULL OR p_amount < 10 THEN RAISE EXCEPTION 'Minimum gift is 10 credits'; END IF;
  IF v_input IS NULL OR v_input = '' THEN RAISE EXCEPTION 'Recipient required'; END IF;

  IF left(v_input,1) = '@' THEN v_input := substr(v_input, 2); END IF;

  SELECT id, COALESCE(username, full_name, email) INTO v_recipient, v_recipient_label
    FROM public.profiles WHERE lower(username) = lower(v_input) LIMIT 1;

  IF v_recipient IS NULL AND position('@' IN v_input) > 0 THEN
    SELECT id, COALESCE(username, full_name, email) INTO v_recipient, v_recipient_label
      FROM public.profiles WHERE lower(email) = lower(v_input) LIMIT 1;
    IF v_recipient IS NULL THEN
      SELECT id, email INTO v_recipient, v_recipient_label
        FROM auth.users WHERE lower(email) = lower(v_input) LIMIT 1;
    END IF;
  END IF;

  IF v_recipient IS NULL THEN
    SELECT id, COALESCE(username, full_name, email) INTO v_recipient, v_recipient_label
      FROM public.profiles WHERE lower(full_name) = lower(v_input) LIMIT 1;
  END IF;

  IF v_recipient IS NULL AND length(v_input) >= 2 THEN
    SELECT count(*) INTO v_match_count
      FROM public.profiles
      WHERE username ILIKE '%' || v_input || '%' OR full_name ILIKE '%' || v_input || '%';
    IF v_match_count = 1 THEN
      SELECT id, COALESCE(username, full_name, email) INTO v_recipient, v_recipient_label
        FROM public.profiles
        WHERE username ILIKE '%' || v_input || '%' OR full_name ILIKE '%' || v_input || '%'
        LIMIT 1;
    ELSIF v_match_count > 1 THEN
      RAISE EXCEPTION 'Multiple users match "%". Please use their exact @username or email.', v_input;
    END IF;
  END IF;

  IF v_recipient IS NULL THEN RAISE EXCEPTION 'Recipient not found'; END IF;
  IF v_recipient = v_sender THEN RAISE EXCEPTION 'Cannot gift to yourself'; END IF;

  SELECT COALESCE(username, full_name, email) INTO v_sender_label
    FROM public.profiles WHERE id = v_sender LIMIT 1;

  PERFORM public.deduct_ai_credits(v_sender, p_amount,
    'gift_sent:to=' || COALESCE(v_recipient_label, v_recipient::text), 'gift_ai_credits');
  PERFORM public.add_ai_credits(v_recipient, p_amount,
    'gift_received:from=' || v_sender::text, 'gift_ai_credits');

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_sender, 'gift_credits', p_amount,
    'Gifted ' || p_amount || ' credits to ' || COALESCE(v_recipient_label, v_recipient::text) ||
    COALESCE(' — "' || p_message || '"', ''));

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_recipient, 'gift_received', 0,
    'Received ' || p_amount || ' credits from a friend' ||
    COALESCE(' — "' || p_message || '"', ''));

  -- Bell notification for recipient
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, metadata)
  VALUES (
    v_recipient,
    v_sender,
    'gift_credits',
    '🎁 You received ' || p_amount || ' AI credits!',
    COALESCE(v_sender_label, 'A friend') || ' sent you ' || p_amount || ' credits' ||
      COALESCE(' — "' || p_message || '"', '.'),
    '/ai-credits',
    jsonb_build_object('amount', p_amount, 'sender_id', v_sender, 'sender_label', v_sender_label, 'message', p_message)
  );

  RETURN jsonb_build_object('recipient_id', v_recipient, 'recipient', v_recipient_label, 'amount', p_amount);
END;
$function$;