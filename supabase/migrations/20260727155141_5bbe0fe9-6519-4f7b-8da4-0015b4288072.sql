CREATE OR REPLACE FUNCTION public.log_ai_credits_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_before INTEGER;
  v_after INTEGER;
  v_delta INTEGER;
  v_reason TEXT;
  v_source TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_before := 0;
    v_after := COALESCE(NEW.credits_remaining, 0);
  ELSE
    v_before := COALESCE(OLD.credits_remaining, 0);
    v_after := COALESCE(NEW.credits_remaining, 0);
  END IF;

  v_delta := v_after - v_before;
  IF v_delta = 0 THEN
    RETURN NEW;
  END IF;

  BEGIN v_reason := current_setting('app.credit_reason', true); EXCEPTION WHEN OTHERS THEN v_reason := NULL; END;
  BEGIN v_source := current_setting('app.credit_source', true); EXCEPTION WHEN OTHERS THEN v_source := NULL; END;

  INSERT INTO public.ai_credits_ledger(user_id, delta, balance_before, balance_after, reason, source, actor)
  VALUES (
    NEW.user_id,
    v_delta,
    v_before,
    v_after,
    COALESCE(NULLIF(v_reason, ''), CASE WHEN TG_OP = 'INSERT' THEN 'initial_insert' ELSE 'unknown_update' END),
    NULLIF(v_source, ''),
    auth.uid()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_credits_ledger ON public.ai_credits;
CREATE TRIGGER trg_ai_credits_ledger
AFTER INSERT OR UPDATE OF credits_remaining ON public.ai_credits
FOR EACH ROW
EXECUTE FUNCTION public.log_ai_credits_change();

CREATE OR REPLACE FUNCTION public.add_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'manual_add'::text,
  p_source text DEFAULT 'rpc'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  PERFORM set_config('app.credit_reason', COALESCE(p_reason, 'manual_add'), true);
  PERFORM set_config('app.credit_source', COALESCE(p_source, 'rpc'), true);

  INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased, updated_at)
  VALUES (p_user_id, p_amount, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET credits_remaining = public.ai_credits.credits_remaining + EXCLUDED.credits_remaining,
      total_credits_purchased = COALESCE(public.ai_credits.total_credits_purchased, 0) + EXCLUDED.total_credits_purchased,
      updated_at = now();

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'manual_deduct'::text,
  p_source text DEFAULT 'rpc'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT credits_remaining INTO v_remaining
  FROM public.ai_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'No credit balance for user';
  END IF;

  IF v_remaining < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  PERFORM set_config('app.credit_reason', COALESCE(p_reason, 'manual_deduct'), true);
  PERFORM set_config('app.credit_source', COALESCE(p_source, 'rpc'), true);

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - p_amount,
      last_used_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.add_ai_credits(uuid, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_ai_credits(uuid, integer, text, text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.deduct_ai_credits(uuid, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deduct_ai_credits(uuid, integer, text, text) TO authenticated, service_role;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT user_id, GREATEST(COALESCE(credits_remaining, 0), 0)::integer AS amount
    FROM public.teen_career_credits
    WHERE COALESCE(credits_remaining, 0) > 0
  LOOP
    PERFORM public.add_ai_credits(r.user_id, r.amount, 'teen_career_legacy_balance_merge', 'migration');
  END LOOP;
END;
$$;