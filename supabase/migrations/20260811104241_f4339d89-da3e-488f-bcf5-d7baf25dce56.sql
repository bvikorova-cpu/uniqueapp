
CREATE TABLE IF NOT EXISTS public.horse_training_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  horse_id uuid,
  stat_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_horse_training_log_user_created ON public.horse_training_log (user_id, created_at DESC);
GRANT SELECT ON public.horse_training_log TO authenticated;
GRANT ALL ON public.horse_training_log TO service_role;
ALTER TABLE public.horse_training_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own training log" ON public.horse_training_log;
CREATE POLICY "own training log" ON public.horse_training_log FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.horse_quest_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_id text NOT NULL,
  period_key text NOT NULL,
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quest_id, period_key)
);
GRANT SELECT ON public.horse_quest_claims TO authenticated;
GRANT ALL ON public.horse_quest_claims TO service_role;
ALTER TABLE public.horse_quest_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own quest claims" ON public.horse_quest_claims;
CREATE POLICY "own quest claims" ON public.horse_quest_claims FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_horse_quest_progress()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  d_start timestamptz := date_trunc('day', now());
  w_start timestamptz := date_trunc('week', now());
  t_speed int; t_stam int; t_any int;
  r_day int; w_day int;
  t_week int; r_week int; w_week int;
  claims jsonb;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('progress', '{}'::jsonb, 'claimed', '[]'::jsonb); END IF;

  SELECT
    count(*) FILTER (WHERE stat_type = 'speed'),
    count(*) FILTER (WHERE stat_type = 'stamina'),
    count(*)
  INTO t_speed, t_stam, t_any
  FROM public.horse_training_log WHERE user_id = uid AND created_at >= d_start;

  SELECT count(*) INTO t_week
  FROM public.horse_training_log WHERE user_id = uid AND created_at >= w_start;

  SELECT count(*), count(*) FILTER (WHERE position = 1)
  INTO r_day, w_day
  FROM public.race_participants WHERE user_id = uid AND created_at >= d_start;

  SELECT count(*), count(*) FILTER (WHERE position = 1)
  INTO r_week, w_week
  FROM public.race_participants WHERE user_id = uid AND created_at >= w_start;

  SELECT coalesce(jsonb_agg(quest_id), '[]'::jsonb) INTO claims
  FROM public.horse_quest_claims
  WHERE user_id = uid
    AND (period_key = to_char(d_start, 'YYYY-MM-DD') OR period_key = 'W' || to_char(w_start, 'IYYY-IW'));

  RETURN jsonb_build_object(
    'progress', jsonb_build_object(
      'train_speed_3', t_speed,
      'train_stamina_3', t_stam,
      'train_any_5', t_any,
      'race_1', r_day,
      'race_3', r_day,
      'win_1', w_day,
      'weekly_train_20', t_week,
      'weekly_race_10', r_week,
      'weekly_win_5', w_week
    ),
    'claimed', claims
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_horse_quest_progress() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_horse_quest_progress() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_horse_quest(_quest_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  reqs jsonb := '{"train_speed_3":3,"train_stamina_3":3,"train_any_5":5,"race_1":1,"race_3":3,"win_1":1,"weekly_train_20":20,"weekly_race_10":10,"weekly_win_5":5}'::jsonb;
  xps jsonb := '{"train_speed_3":30,"train_stamina_3":30,"train_any_5":75,"race_1":50,"race_3":100,"win_1":150,"weekly_train_20":300,"weekly_race_10":500,"weekly_win_5":750}'::jsonb;
  prog jsonb;
  cur int;
  need int;
  xp int;
  pkey text;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('claimed', false, 'reason', 'not_authenticated'); END IF;
  IF NOT reqs ? _quest_id THEN RETURN jsonb_build_object('claimed', false, 'reason', 'unknown_quest'); END IF;

  prog := (public.get_horse_quest_progress())->'progress';
  cur := coalesce((prog->>_quest_id)::int, 0);
  need := (reqs->>_quest_id)::int;
  xp := (xps->>_quest_id)::int;
  pkey := CASE WHEN _quest_id LIKE 'weekly%'
    THEN 'W' || to_char(date_trunc('week', now()), 'IYYY-IW')
    ELSE to_char(date_trunc('day', now()), 'YYYY-MM-DD') END;

  IF cur < need THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'incomplete', 'progress', cur, 'requirement', need);
  END IF;

  BEGIN
    INSERT INTO public.horse_quest_claims (user_id, quest_id, period_key, xp_awarded)
    VALUES (uid, _quest_id, pkey, xp);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_claimed');
  END;

  PERFORM public.award_xp(uid, xp, 'horse_quest', _quest_id);

  RETURN jsonb_build_object('claimed', true, 'xp', xp, 'quest_id', _quest_id);
END;
$$;
REVOKE ALL ON FUNCTION public.claim_horse_quest(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_horse_quest(text) TO authenticated;
