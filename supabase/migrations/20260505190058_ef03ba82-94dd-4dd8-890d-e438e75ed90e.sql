-- Helper: add secret santa credits
CREATE OR REPLACE FUNCTION public.add_secret_santa_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  INSERT INTO public.secret_santa_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET credits_remaining = public.secret_santa_credits.credits_remaining + EXCLUDED.credits_remaining,
      total_credits_purchased = public.secret_santa_credits.total_credits_purchased + EXCLUDED.total_credits_purchased,
      updated_at = now();
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.add_secret_santa_credits(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_secret_santa_credits(uuid, integer) TO authenticated, service_role;

-- Helper: deduct secret santa credits atomically
CREATE OR REPLACE FUNCTION public.deduct_secret_santa_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_remaining integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  SELECT credits_remaining INTO v_remaining FROM public.secret_santa_credits
    WHERE user_id = p_user_id FOR UPDATE;
  IF v_remaining IS NULL THEN RAISE EXCEPTION 'No credit balance'; END IF;
  IF v_remaining < p_amount THEN RAISE EXCEPTION 'Insufficient credits'; END IF;
  UPDATE public.secret_santa_credits
    SET credits_remaining = credits_remaining - p_amount, updated_at = now()
    WHERE user_id = p_user_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.deduct_secret_santa_credits(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deduct_secret_santa_credits(uuid, integer) TO authenticated, service_role;

-- Atomic send gift
CREATE OR REPLACE FUNCTION public.send_secret_santa_gift(
  p_recipient_id uuid,
  p_gift_type text,
  p_gift_emoji text,
  p_gift_value integer,
  p_message text DEFAULT NULL,
  p_is_anonymous boolean DEFAULT true,
  p_animation_type text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender uuid := auth.uid();
  v_gift_id uuid;
  v_sender_name text;
BEGIN
  IF v_sender IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_recipient_id IS NULL THEN RAISE EXCEPTION 'Recipient required'; END IF;
  IF p_gift_value IS NULL OR p_gift_value <= 0 THEN RAISE EXCEPTION 'Invalid gift value'; END IF;

  PERFORM public.deduct_secret_santa_credits(v_sender, p_gift_value);

  INSERT INTO public.secret_santa_gifts
    (sender_id, recipient_id, gift_type, gift_emoji, gift_value, message, is_anonymous)
  VALUES
    (v_sender, p_recipient_id, p_gift_type, p_gift_emoji, p_gift_value, p_message, p_is_anonymous)
  RETURNING id INTO v_gift_id;

  IF p_is_anonymous THEN
    v_sender_name := 'Secret Santa';
  ELSE
    SELECT COALESCE(full_name, 'Someone') INTO v_sender_name FROM public.profiles WHERE id = v_sender;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, related_id, actor_id)
  VALUES (
    p_recipient_id,
    'secret_santa_gift',
    p_gift_emoji || ' New Gift Received!',
    v_sender_name || ' sent you a gift!',
    v_gift_id,
    CASE WHEN p_is_anonymous THEN NULL ELSE v_sender END
  );

  RETURN v_gift_id;
END;
$$;
REVOKE ALL ON FUNCTION public.send_secret_santa_gift(uuid, text, text, integer, text, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_secret_santa_gift(uuid, text, text, integer, text, boolean, text) TO authenticated;