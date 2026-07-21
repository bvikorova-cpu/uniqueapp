-- Weekly Challenges → automatic AI credit rewards on completion.

ALTER TABLE public.forum_challenges
  ADD COLUMN IF NOT EXISTS credit_reward integer NOT NULL DEFAULT 0;

-- Ensure completion columns exist (defensive; they already do in the base migration)
ALTER TABLE public.forum_challenge_progress
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Auto-complete progress when current_value crosses the target,
-- and credit the user's ai_credits balance exactly once per challenge.
CREATE OR REPLACE FUNCTION public.grant_weekly_challenge_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge public.forum_challenges%ROWTYPE;
  v_should_complete boolean := false;
BEGIN
  -- Load challenge; ignore if missing / inactive / expired.
  SELECT * INTO v_challenge
  FROM public.forum_challenges
  WHERE id = NEW.challenge_id;

  IF NOT FOUND OR COALESCE(v_challenge.is_active, false) = false THEN
    RETURN NEW;
  END IF;

  IF v_challenge.ends_at IS NOT NULL AND v_challenge.ends_at < now() THEN
    RETURN NEW;
  END IF;

  -- Detect the false → true transition on `completed`, or an automatic crossover.
  IF NEW.completed = true AND COALESCE(OLD.completed, false) = false THEN
    v_should_complete := true;
  ELSIF NEW.completed = false
        AND COALESCE(OLD.completed, false) = false
        AND COALESCE(NEW.current_value, 0) >= v_challenge.target_value THEN
    NEW.completed := true;
    NEW.completed_at := COALESCE(NEW.completed_at, now());
    v_should_complete := true;
  END IF;

  IF NOT v_should_complete THEN
    RETURN NEW;
  END IF;

  IF NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;

  -- Credit AI credits (if the challenge carries a reward).
  IF COALESCE(v_challenge.credit_reward, 0) > 0 THEN
    -- Tag the ledger row created by the ai_credits trigger.
    PERFORM set_config('app.credit_reason', 'weekly_challenge_reward', true);
    PERFORM set_config('app.credit_source', 'forum_challenge:' || v_challenge.id::text, true);

    INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased)
    VALUES (NEW.user_id, v_challenge.credit_reward, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET credits_remaining = public.ai_credits.credits_remaining + v_challenge.credit_reward,
          updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_weekly_challenge_reward
  ON public.forum_challenge_progress;

CREATE TRIGGER trg_grant_weekly_challenge_reward
BEFORE INSERT OR UPDATE OF current_value, completed
ON public.forum_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public.grant_weekly_challenge_reward();