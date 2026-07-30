-- Public trade board: anyone signed in can see open (unaddressed) pending offers
DROP POLICY IF EXISTS "Anyone can view open pending trades" ON public.pet_trades;
CREATE POLICY "Anyone can view open pending trades"
ON public.pet_trades FOR SELECT TO authenticated
USING (to_user_id IS NULL AND COALESCE(status,'pending') = 'pending');

CREATE OR REPLACE FUNCTION public.accept_pet_trade(p_trade_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  t public.pet_trades%ROWTYPE;
  v_from_bal integer;
  v_to_bal integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO t FROM public.pet_trades WHERE id = p_trade_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade not found';
  END IF;
  IF COALESCE(t.status, 'pending') <> 'pending' THEN
    RAISE EXCEPTION 'Trade is no longer pending';
  END IF;

  -- Open offer: any other user may claim it
  IF t.to_user_id IS NULL THEN
    IF t.from_user_id = v_uid THEN
      RAISE EXCEPTION 'You cannot accept your own offer';
    END IF;
    t.to_user_id := v_uid;
    UPDATE public.pet_trades SET to_user_id = v_uid WHERE id = t.id;
  ELSIF t.to_user_id <> v_uid THEN
    RAISE EXCEPTION 'Only the receiver can accept this trade';
  END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (t.from_user_id, 0) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (t.to_user_id, 0) ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_from_bal FROM public.ai_credits WHERE user_id = t.from_user_id FOR UPDATE;
  SELECT credits_remaining INTO v_to_bal FROM public.ai_credits WHERE user_id = t.to_user_id FOR UPDATE;

  IF COALESCE(t.offered_credits, 0) > 0 AND v_from_bal < t.offered_credits THEN
    RAISE EXCEPTION 'Sender does not have enough credits';
  END IF;
  IF COALESCE(t.requested_credits, 0) > 0 AND v_to_bal < t.requested_credits THEN
    RAISE EXCEPTION 'You do not have enough credits for this trade';
  END IF;

  IF t.offered_pet_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.pets WHERE id = t.offered_pet_id AND user_id = t.from_user_id
  ) THEN
    RAISE EXCEPTION 'Offered pet is no longer owned by the sender';
  END IF;
  IF t.requested_pet_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.pets WHERE id = t.requested_pet_id AND user_id = t.to_user_id
  ) THEN
    RAISE EXCEPTION 'Requested pet is no longer owned by you';
  END IF;

  IF t.offered_pet_id IS NOT NULL THEN
    UPDATE public.pets SET user_id = t.to_user_id WHERE id = t.offered_pet_id;
  END IF;
  IF t.requested_pet_id IS NOT NULL THEN
    UPDATE public.pets SET user_id = t.from_user_id WHERE id = t.requested_pet_id;
  END IF;

  IF COALESCE(t.offered_credits, 0) > 0 THEN
    UPDATE public.ai_credits SET credits_remaining = credits_remaining - t.offered_credits, updated_at = now()
      WHERE user_id = t.from_user_id;
    INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
      VALUES (t.from_user_id, -t.offered_credits, v_from_bal, v_from_bal - t.offered_credits, 'pet_trade_paid', 'pet_trades', v_uid, jsonb_build_object('trade_id', t.id));
    v_from_bal := v_from_bal - t.offered_credits;

    UPDATE public.ai_credits SET credits_remaining = credits_remaining + t.offered_credits, updated_at = now()
      WHERE user_id = t.to_user_id;
    INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
      VALUES (t.to_user_id, t.offered_credits, v_to_bal, v_to_bal + t.offered_credits, 'pet_trade_received', 'pet_trades', v_uid, jsonb_build_object('trade_id', t.id));
    v_to_bal := v_to_bal + t.offered_credits;
  END IF;

  IF COALESCE(t.requested_credits, 0) > 0 THEN
    UPDATE public.ai_credits SET credits_remaining = credits_remaining - t.requested_credits, updated_at = now()
      WHERE user_id = t.to_user_id;
    INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
      VALUES (t.to_user_id, -t.requested_credits, v_to_bal, v_to_bal - t.requested_credits, 'pet_trade_paid', 'pet_trades', v_uid, jsonb_build_object('trade_id', t.id));
    v_to_bal := v_to_bal - t.requested_credits;

    UPDATE public.ai_credits SET credits_remaining = credits_remaining + t.requested_credits, updated_at = now()
      WHERE user_id = t.from_user_id;
    INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
      VALUES (t.from_user_id, t.requested_credits, v_from_bal, v_from_bal + t.requested_credits, 'pet_trade_received', 'pet_trades', v_uid, jsonb_build_object('trade_id', t.id));
    v_from_bal := v_from_bal + t.requested_credits;
  END IF;

  UPDATE public.pet_trades
    SET status = 'completed', accepted_at = now(), completed_at = now()
    WHERE id = t.id;

  -- Notify the offer creator
  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (t.from_user_id, v_uid, 'Pet trade completed',
          'Your pet trade offer was accepted.', 'pet_trade', t.id, '/virtual-pet');

  RETURN jsonb_build_object('success', true, 'trade_id', t.id, 'credits_balance', v_to_bal);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_pet_trade(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_pet_trade(uuid) TO authenticated;

-- Notify the addressed user when a direct trade offer is created
CREATE OR REPLACE FUNCTION public.notify_pet_trade_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.to_user_id IS NOT NULL AND NEW.to_user_id <> NEW.from_user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
    VALUES (NEW.to_user_id, NEW.from_user_id, 'New pet trade offer',
            'Someone sent you a pet trade offer.', 'pet_trade', NEW.id, '/virtual-pet');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_pet_trade_created ON public.pet_trades;
CREATE TRIGGER trg_notify_pet_trade_created
AFTER INSERT ON public.pet_trades
FOR EACH ROW EXECUTE FUNCTION public.notify_pet_trade_created();