
ALTER TABLE public.kids_homework_points DROP CONSTRAINT IF EXISTS kids_homework_points_user_id_key;
ALTER TABLE public.kids_homework_points ADD CONSTRAINT kids_homework_points_user_id_key UNIQUE (user_id);

ALTER TABLE public.kids_homework_user_achievements DROP CONSTRAINT IF EXISTS kids_homework_user_achievements_user_ach_key;
ALTER TABLE public.kids_homework_user_achievements ADD CONSTRAINT kids_homework_user_achievements_user_ach_key UNIQUE (user_id, achievement_id);

CREATE OR REPLACE FUNCTION public.increment_homework_points(p_user_id uuid, p_points integer, p_subject text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_today date := (now() at time zone 'utc')::date;
BEGIN
  INSERT INTO public.kids_homework_points (user_id, total_points, questions_answered, streak_days, last_activity_date)
  VALUES (p_user_id, GREATEST(p_points,0), 1, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = kids_homework_points.total_points + GREATEST(p_points,0),
        questions_answered = kids_homework_points.questions_answered + 1,
        streak_days = CASE
          WHEN kids_homework_points.last_activity_date = v_today THEN kids_homework_points.streak_days
          WHEN kids_homework_points.last_activity_date = v_today - 1 THEN kids_homework_points.streak_days + 1
          ELSE 1
        END,
        last_activity_date = v_today,
        updated_at = now();
END;
$fn$;

GRANT EXECUTE ON FUNCTION public.increment_homework_points(uuid, integer, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.unlock_homework_achievements(p_user_id uuid, p_subject text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_points int := 0;
  v_questions int := 0;
  v_streak int := 0;
  v_math int := 0;
  v_sci int := 0;
  v_eng int := 0;
  v_unlocked int := 0;
  r record;
  v_qualifies boolean;
  v_target int;
BEGIN
  SELECT COALESCE(total_points,0), COALESCE(questions_answered,0), COALESCE(streak_days,0)
    INTO v_points, v_questions, v_streak
  FROM public.kids_homework_points WHERE user_id = p_user_id;

  SELECT
    COALESCE(SUM(CASE WHEN 'math' = ANY(subjects_today) THEN 1 ELSE 0 END),0),
    COALESCE(SUM(CASE WHEN 'science' = ANY(subjects_today) THEN 1 ELSE 0 END),0),
    COALESCE(SUM(CASE WHEN 'english' = ANY(subjects_today) THEN 1 ELSE 0 END),0)
  INTO v_math, v_sci, v_eng
  FROM public.kids_homework_daily_progress WHERE user_id = p_user_id;

  FOR r IN SELECT id, achievement_type, points_required FROM public.kids_homework_achievements LOOP
    v_qualifies := false;
    IF r.achievement_type = 'questions' THEN
      v_target := CASE r.points_required WHEN 10 THEN 1 WHEN 50 THEN 5 WHEN 100 THEN 10 WHEN 250 THEN 25 ELSE r.points_required END;
      IF v_questions >= v_target THEN v_qualifies := true; END IF;
    ELSIF r.achievement_type = 'points' THEN
      IF v_points >= r.points_required THEN v_qualifies := true; END IF;
    ELSIF r.achievement_type = 'streak' THEN
      v_target := CASE r.points_required WHEN 30 THEN 3 WHEN 70 THEN 7 ELSE r.points_required END;
      IF v_streak >= v_target THEN v_qualifies := true; END IF;
    ELSIF r.achievement_type = 'subject_math' AND v_math >= 5 THEN v_qualifies := true;
    ELSIF r.achievement_type = 'subject_science' AND v_sci >= 5 THEN v_qualifies := true;
    ELSIF r.achievement_type = 'subject_english' AND v_eng >= 5 THEN v_qualifies := true;
    END IF;

    IF v_qualifies THEN
      INSERT INTO public.kids_homework_user_achievements (user_id, achievement_id)
      VALUES (p_user_id, r.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      IF FOUND THEN v_unlocked := v_unlocked + 1; END IF;
    END IF;
  END LOOP;

  RETURN v_unlocked;
END;
$fn$;

GRANT EXECUTE ON FUNCTION public.unlock_homework_achievements(uuid, text) TO authenticated, service_role;
