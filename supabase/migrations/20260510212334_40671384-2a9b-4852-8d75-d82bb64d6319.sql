
-- 1. Extend iq_test_results with cognitive breakdown
ALTER TABLE public.iq_test_results
  ADD COLUMN IF NOT EXISTS sub_scores jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS percentile numeric(5,2),
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS total_questions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_iq_test_results_user_completed
  ON public.iq_test_results(user_id, completed_at DESC);

-- 2. iq_user_stats table
CREATE TABLE IF NOT EXISTS public.iq_user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  best_iq integer DEFAULT 0,
  latest_iq integer DEFAULT 0,
  total_tests integer DEFAULT 0,
  total_correct integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_test_date date,
  tier text DEFAULT 'Bronze',
  sub_scores jsonb DEFAULT '{}'::jsonb,
  country_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.iq_user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stats" ON public.iq_user_stats;
CREATE POLICY "Anyone can view stats" ON public.iq_user_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own country" ON public.iq_user_stats;
CREATE POLICY "Users can update own country" ON public.iq_user_stats
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Tier helper
CREATE OR REPLACE FUNCTION public.iq_tier_from_score(_iq integer)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _iq >= 145 THEN 'Legend'
    WHEN _iq >= 135 THEN 'Grandmaster'
    WHEN _iq >= 125 THEN 'Master'
    WHEN _iq >= 115 THEN 'Diamond'
    WHEN _iq >= 105 THEN 'Platinum'
    WHEN _iq >= 95  THEN 'Gold'
    WHEN _iq >= 85  THEN 'Silver'
    ELSE 'Bronze'
  END;
$$;

-- 4. Percentile (normal CDF approximation, mean=100 sd=15)
CREATE OR REPLACE FUNCTION public.iq_percentile(_iq integer)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  z numeric;
  p numeric;
  t numeric;
BEGIN
  z := (_iq::numeric - 100) / 15.0;
  -- Abramowitz & Stegun 7.1.26 erf approximation
  t := 1.0 / (1.0 + 0.3275911 * abs(z) / sqrt(2));
  p := 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t * exp(-(z*z)/2);
  IF z < 0 THEN p := 1 - p; END IF;
  RETURN round(p * 100, 2);
END;
$$;

-- 5. Trigger to maintain iq_user_stats + percentile on insert
CREATE OR REPLACE FUNCTION public.iq_after_test_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  prev_date date;
  new_streak integer := 1;
  prev_longest integer := 0;
  merged jsonb;
BEGIN
  -- compute & store percentile if missing
  IF NEW.percentile IS NULL AND NEW.iq_score IS NOT NULL THEN
    NEW.percentile := iq_percentile(NEW.iq_score);
  END IF;

  SELECT last_test_date, current_streak, longest_streak, sub_scores
    INTO prev_date, new_streak, prev_longest, merged
    FROM iq_user_stats WHERE user_id = NEW.user_id;

  IF prev_date IS NULL THEN
    new_streak := 1; prev_longest := 1; merged := '{}'::jsonb;
  ELSIF prev_date = CURRENT_DATE THEN
    new_streak := COALESCE(new_streak,1);
  ELSIF prev_date = CURRENT_DATE - 1 THEN
    new_streak := COALESCE(new_streak,0) + 1;
  ELSE
    new_streak := 1;
  END IF;

  IF new_streak > COALESCE(prev_longest,0) THEN prev_longest := new_streak; END IF;

  -- merge sub_scores (keep best per area)
  IF NEW.sub_scores IS NOT NULL THEN
    merged := COALESCE(merged,'{}'::jsonb) || NEW.sub_scores;
  END IF;

  INSERT INTO iq_user_stats (user_id, best_iq, latest_iq, total_tests, total_correct, total_questions,
                             current_streak, longest_streak, last_test_date, tier, sub_scores, updated_at)
  VALUES (NEW.user_id, COALESCE(NEW.iq_score,0), COALESCE(NEW.iq_score,0), 1,
          COALESCE(NEW.correct_count,0), COALESCE(NEW.total_questions,0),
          new_streak, prev_longest, CURRENT_DATE,
          iq_tier_from_score(COALESCE(NEW.iq_score,0)), merged, now())
  ON CONFLICT (user_id) DO UPDATE SET
    best_iq = GREATEST(iq_user_stats.best_iq, COALESCE(NEW.iq_score,0)),
    latest_iq = COALESCE(NEW.iq_score, iq_user_stats.latest_iq),
    total_tests = iq_user_stats.total_tests + 1,
    total_correct = iq_user_stats.total_correct + COALESCE(NEW.correct_count,0),
    total_questions = iq_user_stats.total_questions + COALESCE(NEW.total_questions,0),
    current_streak = new_streak,
    longest_streak = prev_longest,
    last_test_date = CURRENT_DATE,
    tier = iq_tier_from_score(GREATEST(iq_user_stats.best_iq, COALESCE(NEW.iq_score,0))),
    sub_scores = merged,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_iq_after_test_insert ON public.iq_test_results;
CREATE TRIGGER trg_iq_after_test_insert
  BEFORE INSERT ON public.iq_test_results
  FOR EACH ROW EXECUTE FUNCTION public.iq_after_test_insert();

-- 6. RPC: get progress (last 30 tests)
CREATE OR REPLACE FUNCTION public.get_iq_progress(_user uuid DEFAULT NULL)
RETURNS TABLE(completed_at timestamptz, iq_score integer, percentile numeric, category text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT completed_at, iq_score, percentile, category
  FROM iq_test_results
  WHERE user_id = COALESCE(_user, auth.uid())
  ORDER BY completed_at DESC
  LIMIT 30;
$$;

-- 7. RPC: country leaderboard
CREATE OR REPLACE FUNCTION public.get_iq_country_leaderboard(_country text)
RETURNS TABLE(user_id uuid, username text, best_iq integer, total_tests integer, tier text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT s.user_id,
         COALESCE(p.full_name, 'Anonymous') AS username,
         s.best_iq,
         s.total_tests,
         s.tier
  FROM iq_user_stats s
  LEFT JOIN profiles p ON p.id = s.user_id
  WHERE s.country_code = upper(_country) AND s.best_iq > 0
  ORDER BY s.best_iq DESC
  LIMIT 50;
$$;
