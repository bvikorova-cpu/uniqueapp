
DROP FUNCTION IF EXISTS public.track_challenge_action(TEXT);

CREATE OR REPLACE FUNCTION public.track_challenge_action(_action TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _row RECORD;
  _completed JSONB := '[]'::jsonb;
  _period TEXT;
  _new_progress INTEGER;
  _was_completed BOOLEAN;
BEGIN
  IF _uid IS NULL THEN RETURN _completed; END IF;

  FOR _row IN
    SELECT id, title, icon, challenge_type, target_count, xp_reward
    FROM public.challenges
    WHERE active = true
      AND action_type = _action
      AND (ends_at IS NULL OR ends_at > now())
  LOOP
    _period := public.challenge_period_key(_row.challenge_type);

    SELECT (completed_at IS NOT NULL) INTO _was_completed
      FROM public.user_challenge_progress
      WHERE user_id = _uid AND challenge_id = _row.id AND period_key = _period;

    IF COALESCE(_was_completed, false) THEN CONTINUE; END IF;

    INSERT INTO public.user_challenge_progress (user_id, challenge_id, period_key, progress)
    VALUES (_uid, _row.id, _period, 1)
    ON CONFLICT (user_id, challenge_id, period_key)
    DO UPDATE SET progress = public.user_challenge_progress.progress + 1,
                  updated_at = now()
    RETURNING progress INTO _new_progress;

    IF _new_progress >= _row.target_count THEN
      UPDATE public.user_challenge_progress
        SET completed_at = now()
        WHERE user_id = _uid AND challenge_id = _row.id AND period_key = _period
          AND completed_at IS NULL;
      PERFORM public.record_daily_activity(_row.xp_reward);
      _completed := _completed || jsonb_build_object(
        'id', _row.id,
        'title', _row.title,
        'icon', _row.icon,
        'xp_reward', _row.xp_reward
      );
    END IF;
  END LOOP;

  RETURN _completed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_challenge_action(TEXT) TO authenticated;
