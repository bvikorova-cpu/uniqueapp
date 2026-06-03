
-- Challenge definitions
CREATE TABLE public.challenges (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '⭐',
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily','weekly','community')),
  action_type TEXT NOT NULL CHECK (action_type IN ('post','comment','reaction','story','share')),
  target_count INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  active BOOLEAN NOT NULL DEFAULT true,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.challenges TO anon, authenticated;
GRANT ALL ON public.challenges TO service_role;

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active challenges" ON public.challenges
  FOR SELECT USING (active = true);

-- Per-user progress per period
CREATE TABLE public.user_challenge_progress (
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id, period_key)
);

GRANT SELECT, INSERT, UPDATE ON public.user_challenge_progress TO authenticated;
GRANT ALL ON public.user_challenge_progress TO service_role;

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress" ON public.user_challenge_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.user_challenge_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_challenge_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Helper to compute current period key
CREATE OR REPLACE FUNCTION public.challenge_period_key(_type TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _type = 'daily' THEN to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD')
    WHEN _type = 'weekly' THEN to_char(date_trunc('week', (now() AT TIME ZONE 'UTC')::date), 'IYYY-IW')
    ELSE 'community-' || to_char(date_trunc('month', now()), 'YYYY-MM')
  END;
$$;

-- Track action: bump all active challenges of matching action_type
CREATE OR REPLACE FUNCTION public.track_challenge_action(_action TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _row RECORD;
  _completed_count INTEGER := 0;
  _period TEXT;
  _new_progress INTEGER;
  _was_completed BOOLEAN;
BEGIN
  IF _uid IS NULL THEN RETURN 0; END IF;

  FOR _row IN
    SELECT id, challenge_type, target_count, xp_reward
    FROM public.challenges
    WHERE active = true
      AND action_type = _action
      AND (ends_at IS NULL OR ends_at > now())
  LOOP
    _period := public.challenge_period_key(_row.challenge_type);

    -- Check if already completed this period
    SELECT (completed_at IS NOT NULL) INTO _was_completed
      FROM public.user_challenge_progress
      WHERE user_id = _uid AND challenge_id = _row.id AND period_key = _period;

    IF COALESCE(_was_completed, false) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.user_challenge_progress (user_id, challenge_id, period_key, progress)
    VALUES (_uid, _row.id, _period, 1)
    ON CONFLICT (user_id, challenge_id, period_key)
    DO UPDATE SET progress = public.user_challenge_progress.progress + 1,
                  updated_at = now()
    RETURNING progress INTO _new_progress;

    IF _new_progress >= _row.target_count THEN
      UPDATE public.user_challenge_progress
        SET completed_at = now()
        WHERE user_id = _uid AND challenge_id = _row.id AND period_key = _period
          AND completed_at IS NULL;
      -- Award XP
      PERFORM public.record_daily_activity(_row.xp_reward);
      _completed_count := _completed_count + 1;
    END IF;
  END LOOP;

  RETURN _completed_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_challenge_action(TEXT) TO authenticated;

-- Get challenges with progress for current user
CREATE OR REPLACE FUNCTION public.get_user_challenges()
RETURNS TABLE(
  id UUID,
  slug TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  challenge_type TEXT,
  target_count INTEGER,
  xp_reward INTEGER,
  progress INTEGER,
  completed BOOLEAN,
  ends_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT c.id, c.slug, c.title, c.description, c.icon, c.challenge_type,
         c.target_count, c.xp_reward,
         COALESCE(p.progress, 0) AS progress,
         (p.completed_at IS NOT NULL) AS completed,
         c.ends_at
  FROM public.challenges c
  LEFT JOIN public.user_challenge_progress p
    ON p.challenge_id = c.id
   AND p.user_id = _uid
   AND p.period_key = public.challenge_period_key(c.challenge_type)
  WHERE c.active = true
    AND (c.ends_at IS NULL OR c.ends_at > now())
  ORDER BY c.challenge_type, c.target_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_challenges() TO authenticated;

-- Seed challenges
INSERT INTO public.challenges (slug, title, description, icon, challenge_type, action_type, target_count, xp_reward) VALUES
  ('daily_creator', 'Daily Creator', 'Post at least once today', '✍️', 'daily', 'post', 1, 50),
  ('social_butterfly', 'Social Butterfly', 'Leave 5 comments on friends'' posts', '💬', 'daily', 'comment', 5, 75),
  ('reaction_master', 'Reaction Master', 'React to 10 posts today', '❤️', 'daily', 'reaction', 10, 30),
  ('weekly_storyteller', 'Weekly Storyteller', 'Share 5 posts this week', '📸', 'weekly', 'post', 5, 200),
  ('community_photo', 'Community Photo Challenge', 'Share your best sunset photo', '🌅', 'community', 'post', 1, 500)
ON CONFLICT (slug) DO NOTHING;
