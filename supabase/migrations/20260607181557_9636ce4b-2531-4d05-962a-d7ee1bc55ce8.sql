
-- 1) CREDIT AUDIT LOG
CREATE TABLE IF NOT EXISTS public.credit_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  source text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_audit_log TO authenticated;
GRANT ALL ON public.credit_audit_log TO service_role;
ALTER TABLE public.credit_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own credit audit"
  ON public.credit_audit_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_credit_audit_user_time ON public.credit_audit_log(user_id, created_at DESC);

-- 2) UPDATE brain_duel_spend_credits to log
CREATE OR REPLACE FUNCTION public.brain_duel_spend_credits(_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  UPDATE public.brain_duel_credits
     SET credits = credits - _amount,
         updated_at = now()
   WHERE user_id = _uid AND credits >= _amount
  RETURNING credits INTO _new;

  IF _new IS NULL THEN RAISE EXCEPTION 'insufficient_credits'; END IF;

  INSERT INTO public.credit_audit_log(user_id, delta, reason, source, context)
  VALUES (_uid, -_amount, 'brain_duel_spend', 'rpc:brain_duel_spend_credits', jsonb_build_object('new_balance', _new));

  RETURN _new;
END;
$$;
REVOKE ALL ON FUNCTION public.brain_duel_spend_credits(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.brain_duel_spend_credits(integer) TO authenticated;

-- 3) STAKE / CHALLENGE VALIDATION
CREATE OR REPLACE FUNCTION public.validate_brain_duel_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.stake_credits IS NULL OR NEW.stake_credits < 0 OR NEW.stake_credits > 1000 THEN
    RAISE EXCEPTION 'invalid_stake (must be 0..1000)';
  END IF;
  IF NEW.challenger_id = NEW.challenged_id THEN
    RAISE EXCEPTION 'cannot_challenge_self';
  END IF;
  IF NEW.expires_at IS NULL OR NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'invalid_expires_at (must be future)';
  END IF;
  IF NEW.expires_at > now() + interval '7 days' THEN
    RAISE EXCEPTION 'expires_at_too_far (max 7 days)';
  END IF;
  IF NEW.category IS NULL OR length(NEW.category) < 1 OR length(NEW.category) > 64 THEN
    RAISE EXCEPTION 'invalid_category';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_validate_brain_duel_challenge ON public.brain_duel_friend_challenges;
CREATE TRIGGER trg_validate_brain_duel_challenge
  BEFORE INSERT ON public.brain_duel_friend_challenges
  FOR EACH ROW EXECUTE FUNCTION public.validate_brain_duel_challenge();

-- 4) STRIPE WEBHOOK IDEMPOTENCY
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb
);
GRANT ALL ON public.stripe_webhook_events TO service_role;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- no policies: only service_role (bypasses RLS) may read/write
