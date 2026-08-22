CREATE OR REPLACE FUNCTION public._grant_xp_and_log(_user_id uuid, _xp integer, _source text, _ref text, _meta jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_points (user_id, total_points, current_level_points, level)
  VALUES (_user_id, _xp, _xp, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = user_points.total_points + EXCLUDED.total_points,
        current_level_points = user_points.current_level_points + EXCLUDED.current_level_points;

  INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
  VALUES (_user_id, _source, 'xp', _xp, _ref, COALESCE(_meta, '{}'::jsonb));

  -- Mirror into the unified XP ledger (idempotent via unique (user_id, source, ref_id))
  PERFORM public.award_xp(_user_id, _xp, _source, _ref);
END $function$;

-- Backfill existing login calendar claims into the unified XP ledger
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id, month_key, day_number, reward_value
           FROM user_calendar_claims WHERE reward_type = 'xp'
  LOOP
    PERFORM public.award_xp(r.user_id, r.reward_value::int, 'login_calendar', r.month_key || ':' || r.day_number);
  END LOOP;
END $$;