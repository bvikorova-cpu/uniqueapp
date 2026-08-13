ALTER TABLE public.kitchen_battles
  ALTER COLUMN prize_pool SET DEFAULT 10;

UPDATE public.kitchen_battles
SET prize_pool = 10
WHERE status = 'open' AND prize_pool <> 10;

CREATE OR REPLACE FUNCTION public.enter_kitchen_competition(
  _battle_id uuid,
  _dish_title text,
  _description text,
  _video_url text,
  _media_size bigint,
  _media_mime text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_battle public.kitchen_battles%ROWTYPE;
  v_participant_id uuid;
  v_balance_before integer;
  v_balance_after integer;
  v_participant_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;
  IF length(trim(COALESCE(_dish_title, ''))) < 1 OR length(_dish_title) > 120 THEN
    RAISE EXCEPTION 'INVALID_DISH_TITLE';
  END IF;
  IF length(COALESCE(_description, '')) > 500 THEN
    RAISE EXCEPTION 'DESCRIPTION_TOO_LONG';
  END IF;
  IF COALESCE(_video_url, '') = '' OR COALESCE(_media_mime, '') NOT IN ('video/mp4', 'video/webm', 'video/quicktime') THEN
    RAISE EXCEPTION 'VALID_VIDEO_REQUIRED';
  END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN
    RAISE EXCEPTION 'INVALID_VIDEO_SIZE';
  END IF;

  SELECT * INTO v_battle
  FROM public.kitchen_battles
  WHERE id = _battle_id
  FOR UPDATE;

  IF NOT FOUND OR v_battle.status <> 'open' OR v_battle.deadline <= now() THEN
    RAISE EXCEPTION 'COMPETITION_NOT_OPEN';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.kitchen_battle_participants
    WHERE battle_id = _battle_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'ALREADY_ENTERED';
  END IF;

  SELECT count(*) INTO v_participant_count
  FROM public.kitchen_battle_participants
  WHERE battle_id = _battle_id;

  IF v_participant_count >= 2 THEN
    RAISE EXCEPTION 'COMPETITION_FULL';
  END IF;

  IF v_participant_count = 0 AND v_battle.created_by IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'ONLY_CREATOR_CAN_SUBMIT_FIRST';
  END IF;
  IF v_participant_count = 1 AND v_battle.created_by = v_user_id THEN
    RAISE EXCEPTION 'OPPONENT_MUST_BE_DIFFERENT_USER';
  END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (v_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_balance_before
  FROM public.ai_credits
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF COALESCE(v_balance_before, 0) < 5 THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  v_balance_after := v_balance_before - 5;
  PERFORM set_config('app.credit_reason', 'kitchenstars_competition_entry', true);
  PERFORM set_config('app.credit_source', 'kitchenstars', true);

  UPDATE public.ai_credits
  SET credits_remaining = v_balance_after,
      last_used_at = now(),
      updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO public.kitchen_battle_participants (
    battle_id, user_id, dish_title, description, video_url,
    media_type, media_size, media_mime
  ) VALUES (
    _battle_id, v_user_id, trim(_dish_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, 'video', _media_size, _media_mime
  )
  RETURNING id INTO v_participant_id;

  UPDATE public.kitchen_battles
  SET prize_pool = 10
  WHERE id = _battle_id;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user_id, 'custom_generation', 5, 'kitchenstars:competition_entry');

  RETURN jsonb_build_object(
    'success', true,
    'participant_id', v_participant_id,
    'balance', v_balance_after,
    'entry_cost', 5,
    'prize_pool', 10
  );
END;
$$;

REVOKE ALL ON FUNCTION public.enter_kitchen_competition(uuid, text, text, text, bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enter_kitchen_competition(uuid, text, text, text, bigint, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.settle_kitchen_competitions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle record;
  v_winner record;
  v_balance_before integer;
  v_balance_after integer;
  v_settled integer := 0;
BEGIN
  FOR v_battle IN
    SELECT id
    FROM public.kitchen_battles
    WHERE status = 'open'
      AND deadline <= now()
      AND winner_participant_id IS NULL
    ORDER BY deadline
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count
    INTO v_winner
    FROM public.kitchen_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC
    LIMIT 1;

    IF v_winner.id IS NULL THEN
      UPDATE public.kitchen_battles
      SET status = 'completed', prize_pool = 0
      WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    INSERT INTO public.ai_credits (user_id, credits_remaining)
    VALUES (v_winner.user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT credits_remaining INTO v_balance_before
    FROM public.ai_credits
    WHERE user_id = v_winner.user_id
    FOR UPDATE;

    v_balance_after := COALESCE(v_balance_before, 0) + 10;
    PERFORM set_config('app.credit_reason', 'kitchenstars_competition_prize', true);
    PERFORM set_config('app.credit_source', 'kitchenstars', true);

    UPDATE public.ai_credits
    SET credits_remaining = v_balance_after,
        updated_at = now()
    WHERE user_id = v_winner.user_id;

    UPDATE public.kitchen_battles
    SET status = 'completed',
        winner_participant_id = v_winner.id,
        prize_pool = 10
    WHERE id = v_battle.id
      AND winner_participant_id IS NULL;

    IF FOUND THEN
      v_settled := v_settled + 1;
    END IF;
  END LOOP;

  RETURN v_settled;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_kitchen_competitions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_kitchen_competitions() TO service_role;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'settle-kitchen-competitions';
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;
  PERFORM cron.schedule(
    'settle-kitchen-competitions',
    '* * * * *',
    'SELECT public.settle_kitchen_competitions();'
  );
END;
$$;