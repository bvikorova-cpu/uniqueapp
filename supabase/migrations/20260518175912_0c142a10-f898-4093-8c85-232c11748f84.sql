-- Founding Members: first 100 paying users get permanent badge + 50 bonus credits
CREATE TABLE IF NOT EXISTS public.founding_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  member_number INTEGER NOT NULL UNIQUE,
  bonus_credits_granted INTEGER NOT NULL DEFAULT 50,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founding_members_number ON public.founding_members(member_number);

ALTER TABLE public.founding_members ENABLE ROW LEVEL SECURITY;

-- Anyone can see who is a founding member (badge is public)
CREATE POLICY "Founding members are publicly viewable"
ON public.founding_members FOR SELECT
USING (true);

-- Only the claim RPC writes here; no direct inserts/updates/deletes from clients
CREATE POLICY "No direct writes to founding_members"
ON public.founding_members FOR INSERT
WITH CHECK (false);

-- Atomic claim function: returns assigned member_number or NULL if full / already claimed
CREATE OR REPLACE FUNCTION public.claim_founding_member()
RETURNS TABLE(member_number INTEGER, already_claimed BOOLEAN, full_cohort BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_existing INTEGER;
  v_count INTEGER;
  v_new_number INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Already claimed?
  SELECT fm.member_number INTO v_existing
  FROM public.founding_members fm
  WHERE fm.user_id = v_user;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT v_existing, true, false;
    RETURN;
  END IF;

  -- Lock against race condition during count
  PERFORM pg_advisory_xact_lock(872341);

  SELECT COUNT(*) INTO v_count FROM public.founding_members;

  IF v_count >= 100 THEN
    RETURN QUERY SELECT NULL::INTEGER, false, true;
    RETURN;
  END IF;

  v_new_number := v_count + 1;

  INSERT INTO public.founding_members(user_id, member_number, bonus_credits_granted)
  VALUES (v_user, v_new_number, 50);

  -- Grant 50 bonus AI credits
  INSERT INTO public.ai_credits(user_id, credits_remaining, last_used_at)
  VALUES (v_user, 50, now())
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + 50;

  -- Audit trail in usage history if table exists
  BEGIN
    INSERT INTO public.ai_usage_history(user_id, usage_type, credits_used, description)
    VALUES (v_user, 'custom_generation', -50, 'Founding Member #' || v_new_number || ' bonus');
  EXCEPTION WHEN OTHERS THEN
    -- ignore if table shape differs
    NULL;
  END;

  RETURN QUERY SELECT v_new_number, false, false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_founding_member() TO authenticated;

-- Public helper: how many slots remain (for marketing copy)
CREATE OR REPLACE FUNCTION public.founding_members_remaining()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 100 - (SELECT COUNT(*)::INTEGER FROM public.founding_members));
$$;

GRANT EXECUTE ON FUNCTION public.founding_members_remaining() TO anon, authenticated;