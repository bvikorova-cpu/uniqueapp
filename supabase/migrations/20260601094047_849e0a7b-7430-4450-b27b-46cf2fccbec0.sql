
-- 1) Extend helpers to accept reason/source and propagate via SET LOCAL
CREATE OR REPLACE FUNCTION public.add_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'manual_add',
  p_source text DEFAULT 'rpc'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  PERFORM set_config('app.credit_reason', COALESCE(p_reason,'manual_add'), true);
  PERFORM set_config('app.credit_source', COALESCE(p_source,'rpc'), true);

  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET credits_remaining = public.ai_credits.credits_remaining + EXCLUDED.credits_remaining,
      updated_at = now();

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'manual_deduct',
  p_source text DEFAULT 'rpc'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_remaining integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT credits_remaining INTO v_remaining
  FROM public.ai_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_remaining IS NULL THEN RAISE EXCEPTION 'No credit balance for user'; END IF;
  IF v_remaining < p_amount THEN RAISE EXCEPTION 'Insufficient credits'; END IF;

  PERFORM set_config('app.credit_reason', COALESCE(p_reason,'manual_deduct'), true);
  PERFORM set_config('app.credit_source', COALESCE(p_source,'rpc'), true);

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - p_amount,
      credits_used = COALESCE(credits_used, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$;

-- 2) Founding member: write reason before direct INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.claim_founding_member()
RETURNS TABLE(member_number integer, already_claimed boolean, full_cohort boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_existing INTEGER;
  v_count INTEGER;
  v_new_number INTEGER;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  SELECT fm.member_number INTO v_existing
  FROM public.founding_members fm WHERE fm.user_id = v_user;
  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT v_existing, true, false; RETURN;
  END IF;

  PERFORM pg_advisory_xact_lock(872341);
  SELECT COUNT(*) INTO v_count FROM public.founding_members;
  IF v_count >= 100 THEN
    RETURN QUERY SELECT NULL::INTEGER, false, true; RETURN;
  END IF;

  v_new_number := v_count + 1;
  INSERT INTO public.founding_members(user_id, member_number, bonus_credits_granted)
  VALUES (v_user, v_new_number, 50);

  PERFORM set_config('app.credit_reason', 'founding_member_bonus:#' || v_new_number, true);
  PERFORM set_config('app.credit_source', 'claim_founding_member', true);

  INSERT INTO public.ai_credits(user_id, credits_remaining, last_used_at)
  VALUES (v_user, 50, now())
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + 50;

  BEGIN
    INSERT INTO public.ai_usage_history(user_id, usage_type, credits_used, description)
    VALUES (v_user, 'custom_generation', -50, 'Founding Member #' || v_new_number || ' bonus');
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN QUERY SELECT v_new_number, false, false;
END;
$$;

-- 3) Gift: tag both sides distinctly
CREATE OR REPLACE FUNCTION public.gift_ai_credits(
  p_recipient_email text,
  p_amount integer,
  p_message text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sender uuid := auth.uid();
  v_recipient uuid;
BEGIN
  IF v_sender IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount IS NULL OR p_amount < 10 THEN RAISE EXCEPTION 'Minimum gift is 10 credits'; END IF;

  SELECT id INTO v_recipient FROM public.profiles WHERE email = p_recipient_email LIMIT 1;
  IF v_recipient IS NULL THEN RAISE EXCEPTION 'Recipient not found'; END IF;
  IF v_recipient = v_sender THEN RAISE EXCEPTION 'Cannot gift to yourself'; END IF;

  PERFORM public.deduct_ai_credits(v_sender, p_amount, 'gift_sent:to=' || p_recipient_email, 'gift_ai_credits');
  PERFORM public.add_ai_credits(v_recipient, p_amount, 'gift_received:from=' || v_sender::text, 'gift_ai_credits');

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_sender, 'gift_credits', p_amount,
    'Gifted ' || p_amount || ' credits to ' || p_recipient_email ||
    COALESCE(' — "' || p_message || '"', ''));

  RETURN true;
END;
$$;

-- 4) Lucky wheel: tag cost + prize
CREATE OR REPLACE FUNCTION public.lucky_wheel_spin(p_cost integer, p_prize integer, p_label text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_cost IS NULL OR p_cost <= 0 THEN RAISE EXCEPTION 'Invalid spin cost'; END IF;
  IF p_prize IS NULL OR p_prize < 0 THEN p_prize := 0; END IF;

  PERFORM public.deduct_ai_credits(v_user, p_cost, 'lucky_wheel_cost', 'lucky_wheel_spin');

  IF p_prize > 0 THEN
    PERFORM public.add_ai_credits(v_user, p_prize, 'lucky_wheel_prize:' || COALESCE(p_label,'?'), 'lucky_wheel_spin');
  END IF;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'lucky_wheel_spin', p_cost, 'Lucky Wheel spin — won: ' || COALESCE(p_label, 'nothing'));

  RETURN true;
END;
$$;

-- 5) Mystery box: tag purchase
CREATE OR REPLACE FUNCTION public.purchase_mystery_box(p_box_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_price integer;
  v_name text;
  v_user_box uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT price, name INTO v_price, v_name FROM public.mystery_boxes WHERE id = p_box_id;
  IF v_price IS NULL THEN RAISE EXCEPTION 'Box not found'; END IF;

  PERFORM public.deduct_ai_credits(v_user, v_price, 'mystery_box_purchase:' || COALESCE(v_name,'?'), 'purchase_mystery_box');

  INSERT INTO public.user_mystery_boxes (user_id, box_id)
  VALUES (v_user, p_box_id) RETURNING id INTO v_user_box;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'mystery_box_purchase', v_price, 'Purchased ' || v_name);

  RETURN v_user_box;
END;
$$;
