CREATE OR REPLACE FUNCTION public.unlock_skill_contact(_offering_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_before integer;
  v_after integer;
  v_today integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT o.user_id INTO v_owner FROM public.skill_offerings o WHERE o.id = _offering_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'OFFERING_NOT_FOUND';
  END IF;

  IF v_owner = v_user_id OR public.has_skill_contact_unlock(v_user_id, _offering_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today
  FROM public.skill_contact_unlocks
  WHERE buyer_id = v_user_id AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN
    RAISE EXCEPTION 'RATE_LIMIT: daily contact unlock limit reached (20 per day)';
  END IF;

  SELECT credits_remaining INTO v_before FROM public.ai_credits WHERE user_id = v_user_id;
  v_after := public.deduct_ai_credits_atomic(v_user_id, 1);

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_user_id, -1, COALESCE(v_before, v_after + 1), v_after,
          'skills_marketplace_contact_unlock', 'skills_marketplace', v_user_id,
          jsonb_build_object('offering_id', _offering_id, 'seller_id', v_owner));

  INSERT INTO public.skill_contact_unlocks (offering_id, buyer_id, credits_spent)
  VALUES (_offering_id, v_user_id, 1)
  ON CONFLICT (offering_id, buyer_id) DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 1, 'balance_after', v_after);
END;
$$;

CREATE INDEX IF NOT EXISTS idx_marketplace_responses_sender_created
  ON public.marketplace_responses (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_responses_pair_created
  ON public.marketplace_responses (sender_id, offering_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_marketplace_message_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_minute integer;
  v_day integer;
  v_thread integer;
  v_dup integer;
BEGIN
  SELECT count(*) INTO v_minute FROM public.marketplace_responses
   WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 minute';
  IF v_minute >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMIT: too many messages, please wait a minute';
  END IF;

  SELECT count(*) INTO v_day FROM public.marketplace_responses
   WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 day';
  IF v_day >= 60 THEN
    RAISE EXCEPTION 'RATE_LIMIT: daily message limit reached (60 per day)';
  END IF;

  SELECT count(*) INTO v_thread FROM public.marketplace_responses
   WHERE sender_id = NEW.sender_id AND offering_id = NEW.offering_id
     AND created_at > now() - interval '1 hour';
  IF v_thread >= 15 THEN
    RAISE EXCEPTION 'RATE_LIMIT: too many messages in this conversation, try again later';
  END IF;

  SELECT count(*) INTO v_dup FROM public.marketplace_responses
   WHERE sender_id = NEW.sender_id AND offering_id = NEW.offering_id
     AND message = NEW.message AND created_at > now() - interval '10 minutes';
  IF v_dup > 0 THEN
    RAISE EXCEPTION 'DUPLICATE_MESSAGE: you already sent this message';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketplace_message_limits ON public.marketplace_responses;
CREATE TRIGGER trg_marketplace_message_limits
  BEFORE INSERT ON public.marketplace_responses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_marketplace_message_limits();