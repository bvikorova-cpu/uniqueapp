
-- =====================================================================
-- P0 SECURITY FIXES (retry with DROP VIEW first)
-- =====================================================================

-- ---------- 1) SPORTS_PREDICTIONS ----------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='sports_predictions' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sports_predictions', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.sports_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tipsters view own predictions"
ON public.sports_predictions FOR SELECT
USING (auth.uid() = tipster_id);

CREATE POLICY "Authenticated users view free predictions"
ON public.sports_predictions FOR SELECT TO authenticated
USING (is_free = true AND COALESCE(is_premium, false) = false);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sports_prediction_purchases') THEN
    EXECUTE $p$
      CREATE POLICY "Buyers view purchased premium predictions"
      ON public.sports_predictions FOR SELECT TO authenticated
      USING (
        COALESCE(is_premium, false) = true
        AND EXISTS (
          SELECT 1 FROM public.sports_prediction_purchases p
          WHERE p.prediction_id = sports_predictions.id
            AND p.user_id = auth.uid()
            AND COALESCE(p.status,'completed') = 'completed'
        )
      )
    $p$;
  END IF;
END $$;

DROP VIEW IF EXISTS public.sports_predictions_public CASCADE;
CREATE VIEW public.sports_predictions_public AS
SELECT
  id, match_id, tipster_id, prediction_type, prediction_value, odds, confidence,
  CASE WHEN COALESCE(is_premium,false) THEN NULL ELSE analysis_text END AS analysis_text,
  CASE WHEN COALESCE(is_premium,false) THEN NULL ELSE key_factors END AS key_factors,
  is_free, is_premium, price, result, settled_at, created_at, updated_at
FROM public.sports_predictions
WHERE COALESCE(is_free, false) = true OR COALESCE(is_premium, false) = true;
GRANT SELECT ON public.sports_predictions_public TO anon, authenticated;

-- ---------- 2) ESCAPE_ROOM_PUZZLES ----------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='escape_room_puzzles' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.escape_room_puzzles', pol.policyname);
  END LOOP;
END $$;
ALTER TABLE public.escape_room_puzzles ENABLE ROW LEVEL SECURITY;

DROP VIEW IF EXISTS public.escape_room_puzzles_public CASCADE;
CREATE VIEW public.escape_room_puzzles_public AS
SELECT id, room_id, puzzle_order, puzzle_type, title, description, puzzle_data,
       hint_text, hint_cost, created_at
FROM public.escape_room_puzzles;
GRANT SELECT ON public.escape_room_puzzles_public TO anon, authenticated;

-- ---------- 3) BRAIN_DUEL_QUESTIONS ----------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='brain_duel_questions' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.brain_duel_questions', pol.policyname);
  END LOOP;
END $$;
ALTER TABLE public.brain_duel_questions ENABLE ROW LEVEL SECURITY;

DROP VIEW IF EXISTS public.brain_duel_questions_public CASCADE;
CREATE VIEW public.brain_duel_questions_public AS
SELECT id, category, question, option_a, option_b, option_c, option_d,
       difficulty, created_at
FROM public.brain_duel_questions;
GRANT SELECT ON public.brain_duel_questions_public TO anon, authenticated;

-- ---------- 4) IQ_QUESTIONS ----------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='iq_questions' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.iq_questions', pol.policyname);
  END LOOP;
END $$;
ALTER TABLE public.iq_questions ENABLE ROW LEVEL SECURITY;

DROP VIEW IF EXISTS public.iq_questions_public CASCADE;
CREATE VIEW public.iq_questions_public AS
SELECT id, question, option_a, option_b, option_c, option_d,
       difficulty, category, time_limit, created_at
FROM public.iq_questions;
GRANT SELECT ON public.iq_questions_public TO anon, authenticated;

-- ---------- 5) IQ_TEST_QUESTIONS ----------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='iq_test_questions' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.iq_test_questions', pol.policyname);
  END LOOP;
END $$;
ALTER TABLE public.iq_test_questions ENABLE ROW LEVEL SECURITY;

DROP VIEW IF EXISTS public.iq_test_questions_public CASCADE;
CREATE VIEW public.iq_test_questions_public AS
SELECT id, test_id, question, options, difficulty, order_num, created_at
FROM public.iq_test_questions;
GRANT SELECT ON public.iq_test_questions_public TO anon, authenticated;

-- ---------- 6) JOB_LISTINGS ----------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='job_listings' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.job_listings', pol.policyname);
  END LOOP;
END $$;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view own job listings"
ON public.job_listings FOR SELECT
USING (auth.uid() = employer_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='job_applications') THEN
    EXECUTE $p$
      CREATE POLICY "Applicants view jobs they applied to"
      ON public.job_listings FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.job_applications a
          WHERE a.job_id = job_listings.id AND a.applicant_id = auth.uid()
        )
      )
    $p$;
  END IF;
END $$;

DROP VIEW IF EXISTS public.job_listings_public CASCADE;
CREATE VIEW public.job_listings_public AS
SELECT id, employer_id, title, description, company_name, location, country,
       category, job_type, salary_min, salary_max, salary_currency,
       requirements, benefits, is_active, views_count, applications_count,
       created_at, updated_at, duration_days, is_featured, paid_status,
       published_at, expires_at
FROM public.job_listings
WHERE is_active = true;
GRANT SELECT ON public.job_listings_public TO anon, authenticated;
