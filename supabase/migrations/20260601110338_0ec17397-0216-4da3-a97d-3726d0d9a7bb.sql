-- Lucky Wheel + Credit Gifts: server-side RPC functions that move credits and
-- write to ai_credits_ledger via the existing trigger by setting
-- app.credit_reason / app.credit_source before each UPDATE.

-- ============================================================
-- 1) Lucky Wheel spin: deducts cost, awards weighted random prize
-- ============================================================
CREATE OR REPLACE FUNCTION public.spin_lucky_wheel()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_cost INT := 5;
  v_balance INT;
  v_roll NUMERIC;
  v_prize INT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  -- Lock the row
  SELECT credits_remaining INTO v_balance
  FROM public.ai_credits
  WHERE user_id = v_user
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'No credit account' USING ERRCODE = 'P0002';
  END IF;
  IF v_balance < v_cost THEN
    RAISE EXCEPTION 'Insufficient credits' USING ERRCODE = '22023';
  END IF;

  -- Weighted random prize
  v_roll := random();
  v_prize := CASE
    WHEN v_roll < 0.40 THEN 0
    WHEN v_roll < 0.70 THEN 2
    WHEN v_roll < 0.85 THEN 5
    WHEN v_roll < 0.95 THEN 10
    WHEN v_roll < 0.99 THEN 25
    ELSE 100
  END;

  -- Deduct cost
  PERFORM set_config('app.credit_reason', 'lucky_wheel_cost', true);
  PERFORM set_config('app.credit_source', 'lucky_wheel', true);
  UPDATE public.ai_credits
    SET credits_remaining = credits_remaining - v_cost,
        updated_at = now()
  WHERE user_id = v_user;

  -- Award prize (if any)
  IF v_prize > 0 THEN
    PERFORM set_config('app.credit_reason', 'lucky_wheel_prize', true);
    PERFORM set_config('app.credit_source', 'lucky_wheel', true);
    UPDATE public.ai_credits
      SET credits_remaining = credits_remaining + v_prize,
          updated_at = now()
    WHERE user_id = v_user;
  END IF;

  RETURN jsonb_build_object(
    'cost', v_cost,
    'prize', v_prize,
    'net', v_prize - v_cost,
    'balance_after', v_balance - v_cost + v_prize
  );
END;
$$;

REVOKE ALL ON FUNCTION public.spin_lucky_wheel() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spin_lucky_wheel() TO authenticated;

-- ============================================================
-- 2) Send credit gift: transfer credits between users by email
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_credit_gift(
  p_recipient_email TEXT,
  p_amount INT,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender UUID := auth.uid();
  v_recipient UUID;
  v_sender_balance INT;
BEGIN
  IF v_sender IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_amount IS NULL OR p_amount < 1 OR p_amount > 1000 THEN
    RAISE EXCEPTION 'Amount must be between 1 and 1000' USING ERRCODE = '22023';
  END IF;

  -- Resolve recipient via auth.users (SECURITY DEFINER allowed access)
  SELECT id INTO v_recipient
  FROM auth.users
  WHERE lower(email) = lower(trim(p_recipient_email))
  LIMIT 1;

  IF v_recipient IS NULL THEN
    RAISE EXCEPTION 'Recipient not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_recipient = v_sender THEN
    RAISE EXCEPTION 'Cannot gift yourself' USING ERRCODE = '22023';
  END IF;

  -- Lock sender row, check balance
  SELECT credits_remaining INTO v_sender_balance
  FROM public.ai_credits
  WHERE user_id = v_sender
  FOR UPDATE;

  IF v_sender_balance IS NULL OR v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits' USING ERRCODE = '22023';
  END IF;

  -- Ensure recipient has a credit row
  INSERT INTO public.ai_credits(user_id, credits_remaining)
  VALUES (v_recipient, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Deduct from sender
  PERFORM set_config('app.credit_reason', 'gift_sent', true);
  PERFORM set_config('app.credit_source', 'credit_gift:' || v_recipient::text, true);
  UPDATE public.ai_credits
    SET credits_remaining = credits_remaining - p_amount,
        updated_at = now()
  WHERE user_id = v_sender;

  -- Credit recipient
  PERFORM set_config('app.credit_reason', 'gift_received', true);
  PERFORM set_config('app.credit_source', 'credit_gift:' || v_sender::text, true);
  UPDATE public.ai_credits
    SET credits_remaining = credits_remaining + p_amount,
        updated_at = now()
  WHERE user_id = v_recipient;

  RETURN jsonb_build_object(
    'recipient_id', v_recipient,
    'amount', p_amount,
    'sender_balance_after', v_sender_balance - p_amount,
    'message', p_message
  );
END;
$$;

REVOKE ALL ON FUNCTION public.send_credit_gift(TEXT, INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_credit_gift(TEXT, INT, TEXT) TO authenticated;