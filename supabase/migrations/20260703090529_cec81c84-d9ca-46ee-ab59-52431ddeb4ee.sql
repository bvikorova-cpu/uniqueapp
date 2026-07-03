
-- ============ ECO CHALLENGES ============
CREATE TABLE public.eco_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT '🌱',
  xp_reward INT NOT NULL DEFAULT 50,
  sponsor_name TEXT,
  sponsor_logo_url TEXT,
  sponsor_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eco_challenges TO anon, authenticated;
GRANT ALL ON public.eco_challenges TO service_role;
ALTER TABLE public.eco_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eco_challenges public read" ON public.eco_challenges FOR SELECT USING (true);
CREATE POLICY "eco_challenges admin write" ON public.eco_challenges FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_eco_challenges_date ON public.eco_challenges(challenge_date DESC);

-- ============ ECO SUBMISSIONS ============
CREATE TABLE public.eco_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.eco_challenges(id) ON DELETE SET NULL,
  challenge_date DATE NOT NULL,
  description TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  votes_count INT NOT NULL DEFAULT 0,
  boosted_until TIMESTAMPTZ,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_date)
);
GRANT SELECT ON public.eco_submissions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.eco_submissions TO authenticated;
GRANT ALL ON public.eco_submissions TO service_role;
ALTER TABLE public.eco_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eco_subs public read" ON public.eco_submissions FOR SELECT USING (is_hidden = false OR auth.uid() = user_id);
CREATE POLICY "eco_subs insert own" ON public.eco_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "eco_subs update own" ON public.eco_submissions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "eco_subs delete own" ON public.eco_submissions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_eco_subs_date ON public.eco_submissions(challenge_date DESC);
CREATE INDEX idx_eco_subs_user ON public.eco_submissions(user_id);
CREATE INDEX idx_eco_subs_votes ON public.eco_submissions(votes_count DESC);

-- ============ ECO VOTES ============
CREATE TABLE public.eco_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.eco_submissions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, voter_id)
);
GRANT SELECT ON public.eco_votes TO anon, authenticated;
GRANT INSERT, DELETE ON public.eco_votes TO authenticated;
GRANT ALL ON public.eco_votes TO service_role;
ALTER TABLE public.eco_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eco_votes public read" ON public.eco_votes FOR SELECT USING (true);
CREATE POLICY "eco_votes insert own" ON public.eco_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id
    AND NOT EXISTS (SELECT 1 FROM public.eco_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid()));
CREATE POLICY "eco_votes delete own" ON public.eco_votes FOR DELETE USING (auth.uid() = voter_id);
CREATE INDEX idx_eco_votes_sub ON public.eco_votes(submission_id);

-- Vote count trigger
CREATE OR REPLACE FUNCTION public.eco_votes_count_trg()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.eco_submissions SET votes_count = votes_count + 1 WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.eco_submissions SET votes_count = GREATEST(0, votes_count - 1) WHERE id = OLD.submission_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER trg_eco_votes_count AFTER INSERT OR DELETE ON public.eco_votes
  FOR EACH ROW EXECUTE FUNCTION public.eco_votes_count_trg();

-- Updated_at trigger
CREATE TRIGGER trg_eco_subs_updated BEFORE UPDATE ON public.eco_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MONTHLY WINNERS ============
CREATE TABLE public.eco_monthly_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  days_completed INT NOT NULL,
  total_votes INT NOT NULL,
  xp_awarded INT NOT NULL DEFAULT 100000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eco_monthly_winners TO anon, authenticated;
GRANT ALL ON public.eco_monthly_winners TO service_role;
ALTER TABLE public.eco_monthly_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eco_winners public read" ON public.eco_monthly_winners FOR SELECT USING (true);

-- ============ LEADERBOARD FUNCTION ============
CREATE OR REPLACE FUNCTION public.get_eco_leaderboard(_month_key TEXT DEFAULT NULL, _limit INT DEFAULT 50)
RETURNS TABLE(
  user_id UUID,
  days_completed BIGINT,
  total_votes BIGINT,
  rank BIGINT
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH mk AS (
    SELECT COALESCE(_month_key, to_char(now(), 'YYYY-MM')) AS m
  ),
  agg AS (
    SELECT s.user_id,
           COUNT(DISTINCT s.challenge_date) AS days_completed,
           COALESCE(SUM(s.votes_count), 0)::BIGINT AS total_votes
    FROM public.eco_submissions s, mk
    WHERE to_char(s.challenge_date, 'YYYY-MM') = mk.m AND s.is_hidden = false
    GROUP BY s.user_id
  )
  SELECT user_id, days_completed, total_votes,
         ROW_NUMBER() OVER (ORDER BY days_completed DESC, total_votes DESC) AS rank
  FROM agg
  ORDER BY days_completed DESC, total_votes DESC
  LIMIT _limit;
$$;
GRANT EXECUTE ON FUNCTION public.get_eco_leaderboard(TEXT, INT) TO anon, authenticated;

-- ============ AWARD MONTHLY WINNER (cron) ============
CREATE OR REPLACE FUNCTION public.award_eco_monthly_winner()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _month TEXT := to_char((now() - INTERVAL '1 day')::date, 'YYYY-MM');
  _winner RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM public.eco_monthly_winners WHERE month_key = _month) THEN
    RETURN jsonb_build_object('status', 'already_awarded', 'month', _month);
  END IF;

  SELECT user_id, days_completed, total_votes
  INTO _winner
  FROM public.get_eco_leaderboard(_month, 1);

  IF _winner.user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'no_participants', 'month', _month);
  END IF;

  INSERT INTO public.eco_monthly_winners(month_key, user_id, days_completed, total_votes, xp_awarded)
  VALUES (_month, _winner.user_id, _winner.days_completed, _winner.total_votes, 100000);

  -- Award XP via existing user_xp table
  INSERT INTO public.user_xp(user_id, total_xp) VALUES (_winner.user_id, 100000)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + 100000;

  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (_winner.user_id, 'eco_winner', '🏆 Eco Champion of the Month!',
    'You won 100,000 XP for being the top eco warrior!', jsonb_build_object('month', _month, 'xp', 100000));

  RETURN jsonb_build_object('status', 'awarded', 'month', _month, 'user_id', _winner.user_id);
END; $$;
GRANT EXECUTE ON FUNCTION public.award_eco_monthly_winner() TO service_role;
