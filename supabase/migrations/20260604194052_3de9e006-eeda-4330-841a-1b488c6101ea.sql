CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE TABLE public.mt_submission_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, user_id, emoji)
);
GRANT SELECT ON public.mt_submission_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.mt_submission_reactions TO authenticated;
GRANT ALL ON public.mt_submission_reactions TO service_role;
ALTER TABLE public.mt_submission_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view submission reactions"
ON public.mt_submission_reactions FOR SELECT
USING (true);
CREATE POLICY "Users can create own submission reactions"
ON public.mt_submission_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own submission reactions"
ON public.mt_submission_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE public.mt_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  view_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mt_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt_stories TO authenticated;
GRANT ALL ON public.mt_stories TO service_role;
ALTER TABLE public.mt_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active stories"
ON public.mt_stories FOR SELECT
USING (expires_at > now());
CREATE POLICY "Users can create own stories"
ON public.mt_stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories"
ON public.mt_stories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories"
ON public.mt_stories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
CREATE TRIGGER update_mt_stories_updated_at
BEFORE UPDATE ON public.mt_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mt_sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  website_url text,
  placement text NOT NULL DEFAULT 'default',
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mt_sponsors TO anon;
GRANT SELECT ON public.mt_sponsors TO authenticated;
GRANT ALL ON public.mt_sponsors TO service_role;
ALTER TABLE public.mt_sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active sponsors"
ON public.mt_sponsors FOR SELECT
USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY "Admins can manage sponsors"
ON public.mt_sponsors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_mt_sponsors_updated_at
BEFORE UPDATE ON public.mt_sponsors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mt_voting_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_vote_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mt_voting_streaks TO authenticated;
GRANT ALL ON public.mt_voting_streaks TO service_role;
ALTER TABLE public.mt_voting_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own voting streak"
ON public.mt_voting_streaks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Users can create own voting streak"
ON public.mt_voting_streaks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voting streak"
ON public.mt_voting_streaks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mt_voting_streaks_updated_at
BEFORE UPDATE ON public.mt_voting_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mt_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  criteria_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_xp integer NOT NULL DEFAULT 0,
  reward_credits integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mt_achievements TO anon;
GRANT SELECT ON public.mt_achievements TO authenticated;
GRANT ALL ON public.mt_achievements TO service_role;
ALTER TABLE public.mt_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active achievements"
ON public.mt_achievements FOR SELECT
USING (active = true);
CREATE POLICY "Admins can manage achievements"
ON public.mt_achievements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_mt_achievements_updated_at
BEFORE UPDATE ON public.mt_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mt_user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.mt_achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT, UPDATE ON public.mt_user_achievements TO authenticated;
GRANT ALL ON public.mt_user_achievements TO service_role;
ALTER TABLE public.mt_user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievement unlocks"
ON public.mt_user_achievements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock own achievements"
ON public.mt_user_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can claim own achievements"
ON public.mt_user_achievements FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mt_user_achievements_updated_at
BEFORE UPDATE ON public.mt_user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.mt_bump_voting_streak(_user_id uuid)
RETURNS public.mt_voting_streaks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date := current_date;
  _row public.mt_voting_streaks;
BEGIN
  INSERT INTO public.mt_voting_streaks (user_id, current_streak, longest_streak, last_vote_date)
  VALUES (_user_id, 1, 1, _today)
  ON CONFLICT (user_id) DO UPDATE
  SET
    current_streak = CASE
      WHEN public.mt_voting_streaks.last_vote_date = _today THEN public.mt_voting_streaks.current_streak
      WHEN public.mt_voting_streaks.last_vote_date = (_today - 1) THEN public.mt_voting_streaks.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(
      public.mt_voting_streaks.longest_streak,
      CASE
        WHEN public.mt_voting_streaks.last_vote_date = _today THEN public.mt_voting_streaks.current_streak
        WHEN public.mt_voting_streaks.last_vote_date = (_today - 1) THEN public.mt_voting_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_vote_date = _today,
    updated_at = now()
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mt_bump_voting_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mt_bump_voting_streak(uuid) TO service_role;

CREATE INDEX idx_mt_submission_reactions_submission_id ON public.mt_submission_reactions(submission_id);
CREATE INDEX idx_mt_stories_expires_at ON public.mt_stories(expires_at);
CREATE INDEX idx_mt_sponsors_active_window ON public.mt_sponsors(active, starts_at, ends_at);
CREATE INDEX idx_mt_user_achievements_user_id ON public.mt_user_achievements(user_id);