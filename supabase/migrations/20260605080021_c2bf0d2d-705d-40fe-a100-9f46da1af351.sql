-- ============================================================
-- C3: Server-side achievement unlock for Megatalent
-- ============================================================
CREATE OR REPLACE FUNCTION public.mt_unlock_user_achievements()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_subs int := 0;
  v_total_votes int := 0;
  v_top_votes int := 0;
  v_inserted int := 0;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- Compute stats server-side from authoritative table.
  SELECT
    COUNT(*),
    COALESCE(SUM(votes_count), 0),
    COALESCE(MAX(votes_count), 0)
  INTO v_subs, v_total_votes, v_top_votes
  FROM public.talent_submissions
  WHERE user_id = v_user AND is_active = true;

  -- Insert any unlocks the user qualifies for, skip already-unlocked.
  WITH eligible AS (
    SELECT a.id
    FROM public.mt_achievements a
    WHERE a.active = true
      AND (
        (a.achievement_key = 'first_upload'      AND v_subs >= 1) OR
        (a.achievement_key = 'five_uploads'      AND v_subs >= 5) OR
        (a.achievement_key = 'ten_uploads'       AND v_subs >= 10) OR
        (a.achievement_key = 'hundred_votes'     AND v_total_votes >= 100) OR
        (a.achievement_key = 'thousand_votes'    AND v_total_votes >= 1000) OR
        (a.achievement_key = 'ten_thousand_votes'AND v_total_votes >= 10000) OR
        (a.achievement_key = 'top_post_500'      AND v_top_votes >= 500)
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.mt_user_achievements ua
        WHERE ua.user_id = v_user AND ua.achievement_id = a.id
      )
  ),
  ins AS (
    INSERT INTO public.mt_user_achievements (user_id, achievement_id, unlocked_at)
    SELECT v_user, id, now() FROM eligible
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted FROM ins;

  RETURN jsonb_build_object(
    'submissions', v_subs,
    'total_votes', v_total_votes,
    'top_votes', v_top_votes,
    'newly_unlocked', v_inserted
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mt_unlock_user_achievements() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mt_unlock_user_achievements() TO authenticated;

-- Belt-and-suspenders: revoke client INSERT/UPDATE grant on table (RLS already blocks).
REVOKE INSERT, UPDATE ON public.mt_user_achievements FROM authenticated;

-- ============================================================
-- C4: Marketplace orders — no client INSERT
-- ============================================================
DROP POLICY IF EXISTS mt_ord_insert_buyer ON public.mt_marketplace_orders;
-- Orders must be created by the escrow edge function (service_role).
REVOKE INSERT ON public.mt_marketplace_orders FROM authenticated, anon;

-- ============================================================
-- C5: Posts visibility — drop overly loose policy
-- ============================================================
-- "View posts by privacy" treated friends/followers as visible to ANY logged-in user.
-- The other policy ("Posts visible by privacy rules") uses can_view_post() which
-- correctly enforces friendship/follower checks.
DROP POLICY IF EXISTS "View posts by privacy" ON public.posts;