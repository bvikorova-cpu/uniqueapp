-- 1) Make user_points an ABSOLUTE mirror of user_xp (no more additive double counting)
CREATE OR REPLACE FUNCTION public.sync_user_xp_to_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total integer := GREATEST(COALESCE(NEW.total_xp, 0), 0);
  _prev integer := 0;
BEGIN
  SELECT total_points INTO _prev FROM public.user_points WHERE user_id = NEW.user_id;

  INSERT INTO public.user_points (user_id, total_points, current_level_points, level)
  VALUES (NEW.user_id, _total, _total, public.calculate_level(_total))
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = _total,
        current_level_points = _total,
        level = public.calculate_level(_total),
        updated_at = now();

  IF _total > COALESCE(_prev, 0) THEN
    INSERT INTO public.activity_logs (user_id, activity_type, points_earned)
    VALUES (NEW.user_id, 'xp_sync', _total - COALESCE(_prev, 0));
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Remove direct user_points writes (award_xp + mirror trigger handle it)
CREATE OR REPLACE FUNCTION public._grant_xp_and_log(_user_id uuid, _xp integer, _source text, _ref text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
  VALUES (_user_id, _source, 'xp', _xp, _ref, COALESCE(_meta, '{}'::jsonb));

  PERFORM public.award_xp(_user_id, _xp, _source, _ref);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_daily_reward_atomic(_user_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := COALESCE(_user_id, auth.uid());
  v_last_streak int;
  v_last_date date;
  v_streak int := 1;
  v_points int := 10;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT day_streak, claimed_date INTO v_last_streak, v_last_date
  FROM public.daily_rewards
  WHERE user_id = v_user
  ORDER BY claimed_at DESC
  LIMIT 1;

  IF v_last_date = (current_date - 1) THEN
    v_streak := COALESCE(v_last_streak, 0) + 1;
  END IF;

  BEGIN
    INSERT INTO public.daily_rewards (user_id, day_streak, points_earned)
    VALUES (v_user, v_streak, v_points);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END;

  PERFORM public.award_xp(v_user, v_points, 'daily_reward', v_user::text || ':' || current_date::text);

  RETURN jsonb_build_object('ok', true, 'pointsEarned', v_points, 'streak', v_streak);
END;
$$;

-- 3) Correct the affected account and clean duplicate sync rows
DELETE FROM public.activity_logs
WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486'
  AND activity_type = 'xp_sync'
  AND created_at > '2026-08-22 22:00+00';

UPDATE public.user_xp
SET total_xp = 1160, updated_at = now()
WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';