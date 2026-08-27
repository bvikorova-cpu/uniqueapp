ALTER TABLE public.gift_transactions
  ADD COLUMN IF NOT EXISTS post_id uuid;

CREATE INDEX IF NOT EXISTS idx_gift_tx_post ON public.gift_transactions(post_id, created_at DESC);

DROP POLICY IF EXISTS "Anyone can view post gift transactions" ON public.gift_transactions;
CREATE POLICY "Anyone can view post gift transactions"
  ON public.gift_transactions FOR SELECT
  TO authenticated
  USING (post_id IS NOT NULL);

CREATE OR REPLACE FUNCTION public.send_post_gift(
  p_gift_id uuid,
  p_post_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_gift public.gift_catalog;
  v_owner uuid;
  v_balance integer;
  v_share integer;
  v_tx_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  SELECT * INTO v_gift
  FROM public.gift_catalog
  WHERE id = p_gift_id AND is_active = true;

  IF v_gift.id IS NULL THEN
    RAISE EXCEPTION 'GIFT_NOT_FOUND';
  END IF;

  SELECT user_id INTO v_owner FROM public.posts WHERE id = p_post_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'POST_NOT_FOUND';
  END IF;

  IF v_owner = v_uid THEN
    RAISE EXCEPTION 'CANNOT_GIFT_SELF';
  END IF;

  SELECT credits_remaining INTO v_balance
  FROM public.ai_credits
  WHERE user_id = v_uid
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < v_gift.price_credits THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  PERFORM set_config('app.credit_reason', 'post_gift_sent', true);
  PERFORM set_config('app.credit_source', 'gift_shop', true);

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - v_gift.price_credits,
      last_used_at = now()
  WHERE user_id = v_uid;

  v_share := floor(v_gift.price_credits / 2.0)::int;

  IF v_share > 0 THEN
    PERFORM set_config('app.credit_reason', 'post_gift_received', true);
    PERFORM set_config('app.credit_source', 'gift_shop', true);

    INSERT INTO public.ai_credits (user_id, credits_remaining)
    VALUES (v_owner, v_share)
    ON CONFLICT (user_id) DO UPDATE
      SET credits_remaining = public.ai_credits.credits_remaining + v_share,
          updated_at = now();
  END IF;

  INSERT INTO public.gift_transactions (
    sender_id, recipient_id, gift_id, post_id,
    credits_spent, recipient_share_credits
  ) VALUES (
    v_uid, v_owner, v_gift.id, p_post_id,
    v_gift.price_credits, v_share
  )
  RETURNING id INTO v_tx_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, action_url, related_id)
  VALUES (
    v_owner,
    v_uid,
    'You received a gift on your post',
    'Someone sent you ' || v_gift.name || ' (' || v_gift.price_credits || ' credits)',
    'gift_received',
    '/social',
    p_post_id
  );

  RETURN v_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_post_gift(uuid, uuid) TO authenticated;