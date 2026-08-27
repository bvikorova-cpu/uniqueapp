CREATE TABLE public.gift_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  price_credits integer NOT NULL CHECK (price_credits > 0),
  rarity text NOT NULL DEFAULT 'common',
  image_url text NOT NULL,
  animation text NOT NULL DEFAULT 'float',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gift_catalog TO anon;
GRANT SELECT ON public.gift_catalog TO authenticated;
GRANT ALL ON public.gift_catalog TO service_role;

ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gifts"
  ON public.gift_catalog FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage gift catalog"
  ON public.gift_catalog FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gift_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  gift_id uuid NOT NULL REFERENCES public.gift_catalog(id),
  conversation_id uuid,
  message_id uuid,
  credits_spent integer NOT NULL,
  recipient_share_credits integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gift_tx_recipient ON public.gift_transactions(recipient_id, created_at DESC);
CREATE INDEX idx_gift_tx_sender ON public.gift_transactions(sender_id, created_at DESC);

GRANT SELECT ON public.gift_transactions TO authenticated;
GRANT ALL ON public.gift_transactions TO service_role;

ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view their gift transactions"
  ON public.gift_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS gift_id uuid REFERENCES public.gift_catalog(id);

CREATE OR REPLACE FUNCTION public.send_chat_gift(
  p_gift_id uuid,
  p_conversation_id uuid,
  p_recipient_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_gift public.gift_catalog;
  v_balance integer;
  v_share integer;
  v_message_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF p_recipient_id = v_uid THEN
    RAISE EXCEPTION 'CANNOT_GIFT_SELF';
  END IF;

  SELECT * INTO v_gift
  FROM public.gift_catalog
  WHERE id = p_gift_id AND is_active = true;

  IF v_gift.id IS NULL THEN
    RAISE EXCEPTION 'GIFT_NOT_FOUND';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'NOT_A_PARTICIPANT';
  END IF;

  SELECT credits_remaining INTO v_balance
  FROM public.ai_credits
  WHERE user_id = v_uid
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < v_gift.price_credits THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  PERFORM set_config('app.credit_reason', 'chat_gift_sent', true);
  PERFORM set_config('app.credit_source', 'gift_shop', true);

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - v_gift.price_credits,
      last_used_at = now()
  WHERE user_id = v_uid;

  v_share := floor(v_gift.price_credits / 2.0)::int;

  IF v_share > 0 THEN
    PERFORM set_config('app.credit_reason', 'chat_gift_received', true);
    PERFORM set_config('app.credit_source', 'gift_shop', true);

    INSERT INTO public.ai_credits (user_id, credits_remaining)
    VALUES (p_recipient_id, v_share)
    ON CONFLICT (user_id) DO UPDATE
      SET credits_remaining = public.ai_credits.credits_remaining + v_share,
          updated_at = now();
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, content, message_type, gift_id)
  VALUES (p_conversation_id, v_uid, v_gift.name, 'gift', v_gift.id)
  RETURNING id INTO v_message_id;

  INSERT INTO public.gift_transactions (
    sender_id, recipient_id, gift_id, conversation_id, message_id,
    credits_spent, recipient_share_credits
  ) VALUES (
    v_uid, p_recipient_id, v_gift.id, p_conversation_id, v_message_id,
    v_gift.price_credits, v_share
  );

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, action_url, related_id)
  VALUES (
    p_recipient_id,
    v_uid,
    'You received a gift',
    'Someone sent you ' || v_gift.name || ' (' || v_gift.price_credits || ' credits)',
    'gift_received',
    '/messenger',
    v_message_id
  );

  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_chat_gift(uuid, uuid, uuid) TO authenticated;