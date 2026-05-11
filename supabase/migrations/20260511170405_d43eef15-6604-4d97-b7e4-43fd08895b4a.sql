-- IQ Goals: users set target IQ and track progress
CREATE TABLE IF NOT EXISTS public.iq_user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  target_iq INTEGER NOT NULL CHECK (target_iq BETWEEN 60 AND 200),
  target_date DATE,
  starting_iq INTEGER,
  note TEXT,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goal" ON public.iq_user_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own goal" ON public.iq_user_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own goal" ON public.iq_user_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own goal" ON public.iq_user_goals
FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_iq_user_goals_updated_at
BEFORE UPDATE ON public.iq_user_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get goal progress
CREATE OR REPLACE FUNCTION public.get_iq_goal_progress()
RETURNS TABLE (
  target_iq INTEGER,
  target_date DATE,
  starting_iq INTEGER,
  current_best INTEGER,
  progress_pct NUMERIC,
  achieved BOOLEAN,
  days_remaining INTEGER,
  note TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _goal RECORD;
  _best INTEGER;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;

  SELECT * INTO _goal FROM iq_user_goals WHERE user_id = _uid;
  IF _goal IS NULL THEN RETURN; END IF;

  SELECT COALESCE(best_iq, 0) INTO _best FROM iq_user_stats WHERE user_id = _uid;
  IF _best IS NULL THEN _best := 0; END IF;

  RETURN QUERY SELECT
    _goal.target_iq,
    _goal.target_date,
    _goal.starting_iq,
    _best,
    CASE
      WHEN _goal.target_iq <= COALESCE(_goal.starting_iq, 0) THEN 100::NUMERIC
      ELSE LEAST(100, GREATEST(0,
        ROUND(((_best - COALESCE(_goal.starting_iq, 0))::NUMERIC /
               NULLIF((_goal.target_iq - COALESCE(_goal.starting_iq, 0))::NUMERIC, 0)) * 100, 1)
      ))
    END,
    (_best >= _goal.target_iq),
    CASE WHEN _goal.target_date IS NOT NULL
      THEN GREATEST(0, (_goal.target_date - CURRENT_DATE))::INTEGER
      ELSE NULL END,
    _goal.note;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_goal_progress() TO authenticated;