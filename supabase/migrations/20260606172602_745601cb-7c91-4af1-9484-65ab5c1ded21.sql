
-- 1) UNIQUE on credits.user_id
ALTER TABLE public.anonymous_dating_credits
  ADD CONSTRAINT anonymous_dating_credits_user_id_key UNIQUE (user_id);

-- 2) Default expires_at = 7 days
ALTER TABLE public.anonymous_dating_matches
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

-- Backfill NULL expires
UPDATE public.anonymous_dating_matches
  SET expires_at = COALESCE(expires_at, created_at + interval '7 days')
  WHERE expires_at IS NULL;

-- 3) Trigger: block unilateral reveal
CREATE OR REPLACE FUNCTION public.anonymous_dating_enforce_mutual_reveal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status is transitioning to 'revealed', both flags must be true.
  IF NEW.status = 'revealed' AND (OLD.status IS DISTINCT FROM 'revealed') THEN
    IF COALESCE(NEW.user1_revealed,false) = false
       OR COALESCE(NEW.user2_revealed,false) = false THEN
      RAISE EXCEPTION 'Mutual reveal required: both user1_revealed and user2_revealed must be true';
    END IF;
  END IF;

  -- Prevent setting reveal_request_by to someone other than the auth user
  IF NEW.reveal_request_by IS DISTINCT FROM OLD.reveal_request_by
     AND NEW.reveal_request_by IS NOT NULL
     AND auth.uid() IS NOT NULL
     AND NEW.reveal_request_by <> auth.uid() THEN
    RAISE EXCEPTION 'reveal_request_by must equal auth.uid()';
  END IF;

  -- Prevent flipping reveal flags for the other user
  IF auth.uid() IS NOT NULL THEN
    IF auth.uid() = OLD.user1_id
       AND COALESCE(NEW.user2_revealed,false) <> COALESCE(OLD.user2_revealed,false) THEN
      RAISE EXCEPTION 'Cannot toggle partner reveal flag';
    END IF;
    IF auth.uid() = OLD.user2_id
       AND COALESCE(NEW.user1_revealed,false) <> COALESCE(OLD.user1_revealed,false) THEN
      RAISE EXCEPTION 'Cannot toggle partner reveal flag';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_anon_dating_mutual_reveal ON public.anonymous_dating_matches;
CREATE TRIGGER trg_anon_dating_mutual_reveal
  BEFORE UPDATE ON public.anonymous_dating_matches
  FOR EACH ROW EXECUTE FUNCTION public.anonymous_dating_enforce_mutual_reveal();

-- 4) Atomic credit deduction RPC
CREATE OR REPLACE FUNCTION public.deduct_anonymous_dating_credits(
  p_user_id uuid,
  p_amount int
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining int;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  UPDATE public.anonymous_dating_credits
     SET credits_remaining = credits_remaining - p_amount,
         updated_at = now()
   WHERE user_id = p_user_id
     AND credits_remaining >= p_amount
  RETURNING credits_remaining INTO v_remaining;

  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  RETURN v_remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_anonymous_dating_credits(uuid,int) FROM public;
GRANT EXECUTE ON FUNCTION public.deduct_anonymous_dating_credits(uuid,int) TO service_role;

-- 5) Atomic credit grant RPC (used by stripe-webhook)
CREATE OR REPLACE FUNCTION public.grant_anonymous_dating_credits(
  p_user_id uuid,
  p_amount int
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining int;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.anonymous_dating_credits (user_id, credits_remaining, total_credits_purchased)
       VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
     SET credits_remaining = public.anonymous_dating_credits.credits_remaining + EXCLUDED.credits_remaining,
         total_credits_purchased = public.anonymous_dating_credits.total_credits_purchased + EXCLUDED.total_credits_purchased,
         updated_at = now()
  RETURNING credits_remaining INTO v_remaining;

  RETURN v_remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_anonymous_dating_credits(uuid,int) FROM public;
GRANT EXECUTE ON FUNCTION public.grant_anonymous_dating_credits(uuid,int) TO service_role;
