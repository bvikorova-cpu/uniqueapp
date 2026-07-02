CREATE OR REPLACE FUNCTION public.claim_calendar_day(_month_key text, _day_number integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _tpl record;
  _today int;
  _today_mkey text;
  _exists int;
  _rtype text;
  _rvalue numeric;
  _local timestamptz := now() AT TIME ZONE 'Europe/Bratislava';
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  _today := EXTRACT(DAY FROM _local)::int;
  _today_mkey := to_char(_local, 'YYYY-MM');
  IF _month_key <> _today_mkey OR _day_number <> _today THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_today');
  END IF;

  SELECT count(*) INTO _exists FROM user_calendar_claims
    WHERE user_id = _uid AND month_key = _month_key AND day_number = _day_number;
  IF _exists > 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'already_claimed'); END IF;

  SELECT reward_type, reward_value INTO _tpl FROM login_calendar_templates
    WHERE month_key = _month_key AND day_number = _day_number LIMIT 1;
  IF _tpl IS NULL THEN
    _rtype := 'xp';
    _rvalue := 25 + (_day_number * 5);
  ELSE
    _rtype := _tpl.reward_type;
    _rvalue := _tpl.reward_value;
  END IF;

  INSERT INTO user_calendar_claims (user_id, month_key, day_number, reward_type, reward_value)
  VALUES (_uid, _month_key, _day_number, _rtype, _rvalue);

  IF _rtype = 'xp' THEN
    PERFORM _grant_xp_and_log(_uid, _rvalue::int, 'login_calendar',
      _month_key || ':' || _day_number,
      jsonb_build_object('day', _day_number, 'month', _month_key));
  ELSE
    INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
    VALUES (_uid, 'login_calendar', _rtype, _rvalue, _month_key || ':' || _day_number,
      jsonb_build_object('day', _day_number, 'month', _month_key));
  END IF;

  RETURN jsonb_build_object('ok', true, 'reward_type', _rtype, 'reward_value', _rvalue);
END $function$;

-- Backfill: user claimed July 2 yesterday but PostgREST outage lost it.
INSERT INTO public.user_calendar_claims (user_id, month_key, day_number, reward_type, reward_value)
SELECT '3c23b29d-c9e2-4495-8772-143464d08486'::uuid, '2026-07', 2,
       COALESCE(t.reward_type, 'xp'),
       COALESCE(t.reward_value, 35)
FROM (SELECT reward_type, reward_value FROM public.login_calendar_templates
      WHERE month_key='2026-07' AND day_number=2 LIMIT 1) t
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_calendar_claims
  WHERE user_id='3c23b29d-c9e2-4495-8772-143464d08486'
    AND month_key='2026-07' AND day_number=2
)
UNION ALL
SELECT '3c23b29d-c9e2-4495-8772-143464d08486'::uuid, '2026-07', 2, 'xp', 35
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_calendar_claims
  WHERE user_id='3c23b29d-c9e2-4495-8772-143464d08486'
    AND month_key='2026-07' AND day_number=2
) AND NOT EXISTS (
  SELECT 1 FROM public.login_calendar_templates WHERE month_key='2026-07' AND day_number=2
);