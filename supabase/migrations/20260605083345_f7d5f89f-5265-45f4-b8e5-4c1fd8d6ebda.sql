
-- ============ H5: UTC-normalized default ============
ALTER TABLE public.daily_quest_completions
  ALTER COLUMN quest_date SET DEFAULT (now() AT TIME ZONE 'UTC')::date;

-- ============ H1: lock down direct client INSERT ============
DROP POLICY IF EXISTS dqc_insert_own ON public.daily_quest_completions;
REVOKE INSERT ON public.daily_quest_completions FROM authenticated, anon;

-- Server-authoritative quest claim
CREATE OR REPLACE FUNCTION public.claim_daily_quest_secure(_quest_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_since timestamptz := date_trunc('day', now() AT TIME ZONE 'UTC');
  v_reward int;
  v_target int;
  v_source text;
  v_count int;
  v_new_total int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- Whitelist of valid quests (server-controlled rewards & sources)
  CASE _quest_id
    WHEN 'vote_3'     THEN v_reward := 5; v_target := 3; v_source := 'talent_votes';
    WHEN 'comment_1'  THEN v_reward := 3; v_target := 1; v_source := 'talent_comments';
    WHEN 'react_1'    THEN v_reward := 2; v_target := 1; v_source := 'mt_submission_reactions';
    WHEN 'story_post' THEN v_reward := 4; v_target := 1; v_source := 'mt_stories';
    ELSE RAISE EXCEPTION 'unknown_quest';
  END CASE;

  -- Count real progress from authorized source table
  EXECUTE format(
    'SELECT count(*)::int FROM public.%I WHERE user_id = $1 AND created_at >= $2',
    v_source
  ) INTO v_count USING v_uid, v_since;

  IF v_count < v_target THEN
    RAISE EXCEPTION 'progress_insufficient' USING DETAIL = format('%s/%s', v_count, v_target);
  END IF;

  -- Idempotent insert; UNIQUE (user_id, quest_id, quest_date) blocks double-claim
  BEGIN
    INSERT INTO public.daily_quest_completions (user_id, quest_id, quest_date, xp_awarded)
    VALUES (v_uid, _quest_id, v_today, v_reward);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END;

  SELECT total_xp INTO v_new_total FROM public.user_xp WHERE user_id = v_uid;

  RETURN jsonb_build_object(
    'ok', true,
    'quest_id', _quest_id,
    'xp_awarded', v_reward,
    'total_xp', COALESCE(v_new_total, 0)
  );
END $$;

REVOKE ALL ON FUNCTION public.claim_daily_quest_secure(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_daily_quest_secure(text) TO authenticated;

-- ============ H3: lock down mt_user_quest_progress writes ============
DROP POLICY IF EXISTS "Users insert own quest progress" ON public.mt_user_quest_progress;
DROP POLICY IF EXISTS "Users update own quest progress" ON public.mt_user_quest_progress;
REVOKE INSERT, UPDATE ON public.mt_user_quest_progress FROM authenticated, anon;
-- SELECT policy + GRANT SELECT remain so users can read their own progress
