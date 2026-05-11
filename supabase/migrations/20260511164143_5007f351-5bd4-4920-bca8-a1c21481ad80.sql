CREATE OR REPLACE FUNCTION public.award_iq_badges()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _best INT := 0;
  _tests INT := 0;
  _streak INT := 0;
  _duel_wins INT := 0;
  _new TEXT[] := ARRAY[]::TEXT[];
  _candidates JSONB := '[
    {"code":"first_test","threshold":1,"metric":"tests","points":10},
    {"code":"iq_100","threshold":100,"metric":"iq","points":25},
    {"code":"iq_120","threshold":120,"metric":"iq","points":50},
    {"code":"iq_140","threshold":140,"metric":"iq","points":100},
    {"code":"iq_160","threshold":160,"metric":"iq","points":200},
    {"code":"streak_7","threshold":7,"metric":"streak","points":20},
    {"code":"streak_30","threshold":30,"metric":"streak","points":75},
    {"code":"streak_100","threshold":100,"metric":"streak","points":250},
    {"code":"scholar","threshold":10,"metric":"tests","points":60},
    {"code":"duel_win","threshold":1,"metric":"duels","points":15},
    {"code":"duel_10","threshold":10,"metric":"duels","points":50},
    {"code":"duel_50","threshold":50,"metric":"duels","points":150}
  ]'::JSONB;
  _c JSONB;
  _val INT;
  _inserted INT;
BEGIN
  IF _uid IS NULL THEN
    RETURN _new;
  END IF;

  SELECT COALESCE(best_iq,0), COALESCE(total_tests,0), COALESCE(longest_streak,0)
    INTO _best, _tests, _streak
  FROM public.iq_user_stats
  WHERE user_id = _uid;

  BEGIN
    SELECT COUNT(*) INTO _duel_wins
    FROM public.brain_duel_matches
    WHERE winner_id = _uid AND status = 'finished';
  EXCEPTION WHEN undefined_table THEN
    _duel_wins := 0;
  END;

  FOR _c IN SELECT * FROM jsonb_array_elements(_candidates)
  LOOP
    _val := CASE _c->>'metric'
      WHEN 'iq' THEN _best
      WHEN 'tests' THEN _tests
      WHEN 'streak' THEN _streak
      WHEN 'duels' THEN _duel_wins
      ELSE 0
    END;

    IF _val >= (_c->>'threshold')::INT THEN
      WITH ins AS (
        INSERT INTO public.iq_user_badges (user_id, code, points)
        VALUES (_uid, _c->>'code', (_c->>'points')::INT)
        ON CONFLICT (user_id, code) DO NOTHING
        RETURNING 1
      )
      SELECT COUNT(*) INTO _inserted FROM ins;

      IF _inserted > 0 THEN
        _new := _new || (_c->>'code');
      END IF;
    END IF;
  END LOOP;

  RETURN _new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_iq_badges() TO authenticated;
