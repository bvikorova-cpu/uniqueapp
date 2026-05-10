
-- 1. iq_user_badges (text codes match existing IQAchievements UI)
CREATE TABLE IF NOT EXISTS public.iq_user_badges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, code)
);
ALTER TABLE public.iq_user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own badges" ON public.iq_user_badges;
CREATE POLICY "Users view own badges" ON public.iq_user_badges
  FOR SELECT USING (auth.uid() = user_id);
-- only server-side awards (no INSERT/UPDATE/DELETE policy → blocked)

-- 2. Streak claims
CREATE TABLE IF NOT EXISTS public.iq_streak_claims (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_milestone integer NOT NULL,
  credits_awarded integer NOT NULL,
  claimed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, day_milestone)
);
ALTER TABLE public.iq_streak_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own claims" ON public.iq_streak_claims;
CREATE POLICY "Users view own claims" ON public.iq_streak_claims
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Helper to award a badge (idempotent, server-only)
CREATE OR REPLACE FUNCTION public.iq_award_badge(_user uuid, _code text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  INSERT INTO iq_user_badges(user_id, code) VALUES (_user, _code)
  ON CONFLICT DO NOTHING;
$$;

-- 4. Trigger: when iq_user_stats changes, auto-award badges
CREATE OR REPLACE FUNCTION public.iq_check_badges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.total_tests >= 1 THEN PERFORM iq_award_badge(NEW.user_id,'first_test'); END IF;
  IF NEW.total_tests >= 10 THEN PERFORM iq_award_badge(NEW.user_id,'scholar'); END IF;
  IF NEW.best_iq >= 100 THEN PERFORM iq_award_badge(NEW.user_id,'iq_100'); END IF;
  IF NEW.best_iq >= 120 THEN PERFORM iq_award_badge(NEW.user_id,'iq_120'); END IF;
  IF NEW.best_iq >= 140 THEN PERFORM iq_award_badge(NEW.user_id,'iq_140'); END IF;
  IF NEW.current_streak >= 7  OR NEW.longest_streak >= 7  THEN PERFORM iq_award_badge(NEW.user_id,'streak_7'); END IF;
  IF NEW.current_streak >= 30 OR NEW.longest_streak >= 30 THEN PERFORM iq_award_badge(NEW.user_id,'streak_30'); END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_iq_check_badges ON public.iq_user_stats;
CREATE TRIGGER trg_iq_check_badges
  AFTER INSERT OR UPDATE ON public.iq_user_stats
  FOR EACH ROW EXECUTE FUNCTION public.iq_check_badges();

-- 5. Duel win badge — fire when iq_duels finishes
CREATE OR REPLACE FUNCTION public.iq_check_duel_badges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE wins integer;
BEGIN
  IF NEW.status = 'finished' AND NEW.winner_id IS NOT NULL THEN
    PERFORM iq_award_badge(NEW.winner_id,'duel_win');
    SELECT COUNT(*) INTO wins FROM iq_duels WHERE winner_id = NEW.winner_id AND status='finished';
    IF wins >= 10 THEN PERFORM iq_award_badge(NEW.winner_id,'duel_10'); END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_iq_check_duel_badges ON public.iq_duels;
CREATE TRIGGER trg_iq_check_duel_badges
  AFTER UPDATE ON public.iq_duels
  FOR EACH ROW EXECUTE FUNCTION public.iq_check_duel_badges();

-- 6. Tournament join badge
CREATE OR REPLACE FUNCTION public.iq_check_tournament_badge()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM iq_award_badge(NEW.user_id,'tournament_join');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_iq_check_tournament_badge ON public.iq_competition_participants;
CREATE TRIGGER trg_iq_check_tournament_badge
  AFTER INSERT ON public.iq_competition_participants
  FOR EACH ROW EXECUTE FUNCTION public.iq_check_tournament_badge();

-- 7. Claim streak reward RPC
CREATE OR REPLACE FUNCTION public.claim_iq_streak_reward(_day integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  current_s integer;
  reward integer;
  already boolean;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;

  reward := CASE _day
    WHEN 3 THEN 2
    WHEN 7 THEN 5
    WHEN 14 THEN 10
    WHEN 30 THEN 25
    WHEN 60 THEN 50
    WHEN 100 THEN 100
    ELSE 0
  END;
  IF reward = 0 THEN RETURN jsonb_build_object('error','invalid_milestone'); END IF;

  SELECT current_streak INTO current_s FROM iq_user_stats WHERE user_id = uid;
  IF COALESCE(current_s,0) < _day THEN
    RETURN jsonb_build_object('error','streak_too_short','current', COALESCE(current_s,0));
  END IF;

  SELECT EXISTS(SELECT 1 FROM iq_streak_claims WHERE user_id=uid AND day_milestone=_day) INTO already;
  IF already THEN RETURN jsonb_build_object('error','already_claimed'); END IF;

  INSERT INTO iq_streak_claims(user_id, day_milestone, credits_awarded) VALUES (uid, _day, reward);
  INSERT INTO iq_credits(user_id, balance) VALUES (uid, reward)
    ON CONFLICT (user_id) DO UPDATE SET balance = iq_credits.balance + reward, updated_at = now();

  RETURN jsonb_build_object('ok', true, 'credits', reward);
END;
$$;

-- 8. Re-test cooldown check
CREATE OR REPLACE FUNCTION public.iq_test_cooldown_remaining(_category text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT GREATEST(0, 86400 - EXTRACT(EPOCH FROM (now() - MAX(completed_at)))::integer)
  FROM iq_test_results
  WHERE user_id = auth.uid() AND category = _category;
$$;

-- 9. Training plan: weakest 3 sub-areas
CREATE OR REPLACE FUNCTION public.get_iq_training_plan()
RETURNS TABLE(domain text, score integer, recommendation text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  sub jsonb;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT sub_scores INTO sub FROM iq_user_stats WHERE user_id = uid;
  IF sub IS NULL OR sub = '{}'::jsonb THEN
    RETURN QUERY SELECT 'general'::text, 0, 'Take your first IQ test to unlock a personalised plan'::text;
    RETURN;
  END IF;
  RETURN QUERY
    SELECT k::text AS domain,
           (v::text)::integer AS score,
           CASE k
             WHEN 'memory' THEN 'Daily memory drills via AI Tools → Pattern Recall'
             WHEN 'logic' THEN 'Practice Logic Duels in Quick mode (5Q)'
             WHEN 'spatial' THEN 'Try the Spatial Reasoning AI tool 3× this week'
             WHEN 'verbal' THEN 'Solve Verbal Riddles via Daily Challenge'
             WHEN 'speed' THEN 'Run Blitz Duels (20 hard Q in 5 min)'
             WHEN 'pattern' THEN 'Pattern Recognition AI tool — 10 sessions'
             ELSE 'Mix daily challenges across all areas'
           END
    FROM jsonb_each_text(sub)
    ORDER BY (v::text)::integer ASC NULLS FIRST
    LIMIT 3;
END;
$$;
