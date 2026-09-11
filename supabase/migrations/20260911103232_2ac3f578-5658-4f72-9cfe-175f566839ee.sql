ALTER TABLE public.gift_transactions
  ADD COLUMN IF NOT EXISTS paid_funded boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.gift_paid_credit_allowance(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    0,
    COALESCE((
      SELECT SUM(delta)::int
      FROM public.ai_credits_ledger
      WHERE user_id = p_user_id
        AND delta > 0
        AND (
          source ILIKE '%stripe%'
          OR source ILIKE '%verify-credits-payment%'
          OR reason ILIKE '%stripe%'
          OR reason ILIKE '%purchase%'
        )
    ), 0)
    -
    COALESCE((
      SELECT SUM(credits_spent)::int
      FROM public.gift_transactions
      WHERE sender_id = p_user_id AND paid_funded = true
    ), 0)
  );
$$;

REVOKE ALL ON FUNCTION public.gift_paid_credit_allowance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gift_paid_credit_allowance(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.send_chat_gift(p_gift_id uuid, p_conversation_id uuid, p_recipient_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_gift public.gift_catalog;
  v_balance integer;
  v_eur numeric := 0;
  v_paid boolean := false;
  v_message_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF p_recipient_id = v_uid THEN RAISE EXCEPTION 'CANNOT_GIFT_SELF'; END IF;

  SELECT * INTO v_gift FROM public.gift_catalog WHERE id = p_gift_id AND is_active = true;
  IF v_gift.id IS NULL THEN RAISE EXCEPTION 'GIFT_NOT_FOUND'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = v_uid
  ) THEN RAISE EXCEPTION 'NOT_A_PARTICIPANT'; END IF;

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_uid FOR UPDATE;
  IF v_balance IS NULL OR v_balance < v_gift.price_credits THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  v_paid := public.gift_paid_credit_allowance(v_uid) >= v_gift.price_credits;

  PERFORM set_config('app.credit_reason', 'chat_gift_sent', true);
  PERFORM set_config('app.credit_source', 'gift_shop', true);

  UPDATE public.ai_credits
     SET credits_remaining = credits_remaining - v_gift.price_credits, last_used_at = now()
   WHERE user_id = v_uid;

  IF v_paid THEN
    v_eur := public.gift_recipient_share_eur(v_gift.price_credits);

    INSERT INTO public.gift_creator_balance (user_id, earned_eur, gifts_received)
    VALUES (p_recipient_id, v_eur, 1)
    ON CONFLICT (user_id) DO UPDATE
      SET earned_eur = public.gift_creator_balance.earned_eur + v_eur,
          gifts_received = public.gift_creator_balance.gifts_received + 1,
          updated_at = now();
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, content, message_type, gift_id)
  VALUES (p_conversation_id, v_uid, v_gift.name, 'gift', v_gift.id)
  RETURNING id INTO v_message_id;

  INSERT INTO public.gift_transactions (
    sender_id, recipient_id, gift_id, conversation_id, message_id,
    credits_spent, recipient_share_credits, recipient_share_eur, paid_funded
  ) VALUES (
    v_uid, p_recipient_id, v_gift.id, p_conversation_id, v_message_id,
    v_gift.price_credits, 0, v_eur, v_paid
  );

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, action_url, related_id)
  VALUES (p_recipient_id, v_uid, 'You received a gift',
    CASE WHEN v_paid
      THEN 'Someone sent you ' || v_gift.name || ' (+EUR ' || to_char(v_eur, 'FM999990.00') || ' earnings)'
      ELSE 'Someone sent you ' || v_gift.name || ' (sent with free credits - no earnings)'
    END,
    'gift_received', '/gifts/inbox', v_message_id);

  RETURN v_message_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_post_gift(p_gift_id uuid, p_post_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_gift public.gift_catalog;
  v_owner uuid;
  v_balance integer;
  v_eur numeric := 0;
  v_paid boolean := false;
  v_tx_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;

  SELECT * INTO v_gift FROM public.gift_catalog WHERE id = p_gift_id AND is_active = true;
  IF v_gift.id IS NULL THEN RAISE EXCEPTION 'GIFT_NOT_FOUND'; END IF;

  SELECT user_id INTO v_owner FROM public.posts WHERE id = p_post_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'POST_NOT_FOUND'; END IF;
  IF v_owner = v_uid THEN RAISE EXCEPTION 'CANNOT_GIFT_SELF'; END IF;

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_uid FOR UPDATE;
  IF v_balance IS NULL OR v_balance < v_gift.price_credits THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  v_paid := public.gift_paid_credit_allowance(v_uid) >= v_gift.price_credits;

  PERFORM set_config('app.credit_reason', 'post_gift_sent', true);
  PERFORM set_config('app.credit_source', 'gift_shop', true);

  UPDATE public.ai_credits
     SET credits_remaining = credits_remaining - v_gift.price_credits, last_used_at = now()
   WHERE user_id = v_uid;

  IF v_paid THEN
    v_eur := public.gift_recipient_share_eur(v_gift.price_credits);

    INSERT INTO public.gift_creator_balance (user_id, earned_eur, gifts_received)
    VALUES (v_owner, v_eur, 1)
    ON CONFLICT (user_id) DO UPDATE
      SET earned_eur = public.gift_creator_balance.earned_eur + v_eur,
          gifts_received = public.gift_creator_balance.gifts_received + 1,
          updated_at = now();
  END IF;

  INSERT INTO public.gift_transactions (
    sender_id, recipient_id, gift_id, post_id,
    credits_spent, recipient_share_credits, recipient_share_eur, paid_funded
  ) VALUES (
    v_uid, v_owner, v_gift.id, p_post_id, v_gift.price_credits, 0, v_eur, v_paid
  )
  RETURNING id INTO v_tx_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, action_url, related_id)
  VALUES (v_owner, v_uid, 'You received a gift on your post',
    CASE WHEN v_paid
      THEN 'Someone sent you ' || v_gift.name || ' (+EUR ' || to_char(v_eur, 'FM999990.00') || ' earnings)'
      ELSE 'Someone sent you ' || v_gift.name || ' (sent with free credits - no earnings)'
    END,
    'gift_received', '/gifts/inbox', p_post_id);

  RETURN v_tx_id;
END;
$function$;