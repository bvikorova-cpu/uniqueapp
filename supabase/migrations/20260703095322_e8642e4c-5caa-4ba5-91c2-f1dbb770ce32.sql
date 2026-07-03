
-- =========================================================
-- HEALTHY CHALLENGE — daily healthy lifestyle proof platform
-- =========================================================

-- 1. CHALLENGES
CREATE TABLE public.healthy_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fitness',
  icon TEXT NOT NULL DEFAULT '💪',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  sponsor_name TEXT,
  sponsor_logo_url TEXT,
  sponsor_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.healthy_challenges TO anon, authenticated;
GRANT ALL ON public.healthy_challenges TO service_role;
ALTER TABLE public.healthy_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "healthy_challenges_read_all" ON public.healthy_challenges FOR SELECT USING (true);
CREATE POLICY "healthy_challenges_admin_write" ON public.healthy_challenges
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. SUBMISSIONS
CREATE TABLE public.healthy_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.healthy_challenges(id) ON DELETE SET NULL,
  challenge_date DATE NOT NULL,
  description TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  votes_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  boosted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_date)
);
GRANT SELECT ON public.healthy_submissions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.healthy_submissions TO authenticated;
GRANT ALL ON public.healthy_submissions TO service_role;
ALTER TABLE public.healthy_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "healthy_subs_read" ON public.healthy_submissions FOR SELECT USING (is_hidden = false OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "healthy_subs_insert" ON public.healthy_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "healthy_subs_update_own" ON public.healthy_submissions FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "healthy_subs_delete_own" ON public.healthy_submissions FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_healthy_subs_date ON public.healthy_submissions(challenge_date DESC);
CREATE INDEX idx_healthy_subs_user_month ON public.healthy_submissions(user_id, challenge_date);

-- 3. VOTES
CREATE TABLE public.healthy_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.healthy_submissions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, voter_id)
);
GRANT SELECT ON public.healthy_votes TO anon, authenticated;
GRANT INSERT, DELETE ON public.healthy_votes TO authenticated;
GRANT ALL ON public.healthy_votes TO service_role;
ALTER TABLE public.healthy_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "healthy_votes_read" ON public.healthy_votes FOR SELECT USING (true);
CREATE POLICY "healthy_votes_insert" ON public.healthy_votes FOR INSERT TO authenticated
  WITH CHECK (voter_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.healthy_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid()));
CREATE POLICY "healthy_votes_delete_own" ON public.healthy_votes FOR DELETE TO authenticated USING (voter_id = auth.uid());

-- Vote count trigger
CREATE OR REPLACE FUNCTION public.healthy_votes_count_trg()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.healthy_submissions SET votes_count = votes_count + 1 WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.healthy_submissions SET votes_count = GREATEST(0, votes_count - 1) WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER healthy_votes_count
AFTER INSERT OR DELETE ON public.healthy_votes
FOR EACH ROW EXECUTE FUNCTION public.healthy_votes_count_trg();

-- 4. MONTHLY WINNERS
CREATE TABLE public.healthy_monthly_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  days_completed INTEGER NOT NULL,
  total_votes INTEGER NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 100000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.healthy_monthly_winners TO anon, authenticated;
GRANT ALL ON public.healthy_monthly_winners TO service_role;
ALTER TABLE public.healthy_monthly_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "healthy_winners_read" ON public.healthy_monthly_winners FOR SELECT USING (true);
CREATE POLICY "healthy_winners_admin_write" ON public.healthy_monthly_winners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. LEADERBOARD RPC
CREATE OR REPLACE FUNCTION public.get_healthy_leaderboard(_month_key TEXT, _limit INTEGER DEFAULT 20)
RETURNS TABLE (user_id UUID, days_completed BIGINT, total_votes BIGINT, rank BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH agg AS (
    SELECT s.user_id,
           COUNT(DISTINCT s.challenge_date) AS days_completed,
           COALESCE(SUM(s.votes_count), 0)::BIGINT AS total_votes
    FROM public.healthy_submissions s
    WHERE to_char(s.challenge_date, 'YYYY-MM') = _month_key
      AND s.is_hidden = false
    GROUP BY s.user_id
  )
  SELECT user_id, days_completed, total_votes,
         RANK() OVER (ORDER BY days_completed DESC, total_votes DESC)::BIGINT AS rank
  FROM agg
  ORDER BY days_completed DESC, total_votes DESC
  LIMIT _limit
$$;
GRANT EXECUTE ON FUNCTION public.get_healthy_leaderboard(TEXT, INTEGER) TO anon, authenticated;

-- 6. AWARD WINNER
CREATE OR REPLACE FUNCTION public.award_healthy_monthly_winner(_month_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  winner RECORD;
BEGIN
  SELECT * INTO winner FROM public.get_healthy_leaderboard(_month_key, 1);
  IF winner.user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no submissions');
  END IF;
  INSERT INTO public.healthy_monthly_winners (month_key, user_id, days_completed, total_votes, xp_awarded)
  VALUES (_month_key, winner.user_id, winner.days_completed, winner.total_votes, 100000)
  ON CONFLICT (month_key) DO NOTHING;
  BEGIN
    PERFORM public.record_daily_activity_for_user(winner.user_id, 100000);
  EXCEPTION WHEN undefined_function THEN NULL;
  END;
  RETURN jsonb_build_object('success', true, 'user_id', winner.user_id, 'xp', 100000);
END $$;
GRANT EXECUTE ON FUNCTION public.award_healthy_monthly_winner(TEXT) TO service_role;

-- updated_at trigger
CREATE TRIGGER healthy_challenges_updated_at BEFORE UPDATE ON public.healthy_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER healthy_subs_updated_at BEFORE UPDATE ON public.healthy_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
