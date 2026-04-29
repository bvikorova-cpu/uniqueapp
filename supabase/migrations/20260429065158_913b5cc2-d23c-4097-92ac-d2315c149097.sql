-- Seasonal Missions: full backend
CREATE TABLE IF NOT EXISTS public.seasonal_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎯',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('post_created','hashtag_used','event_attended','streak_days','post_commented','photo_uploaded')),
  target INTEGER NOT NULL CHECK (target > 0),
  reward_label TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seasonal_missions_active ON public.seasonal_missions(is_active, ends_at);

CREATE TABLE IF NOT EXISTS public.user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.seasonal_missions(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_ump_user ON public.user_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ump_mission ON public.user_mission_progress(mission_id);

ALTER TABLE public.seasonal_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active missions
CREATE POLICY "Active missions are viewable by authenticated users"
  ON public.seasonal_missions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage missions"
  ON public.seasonal_missions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view only their own progress
CREATE POLICY "Users view own mission progress"
  ON public.user_mission_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all mission progress"
  ON public.user_mission_progress FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_seasonal_missions_updated
  BEFORE UPDATE ON public.seasonal_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_ump_updated
  BEFORE UPDATE ON public.user_mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: increment mission progress for a user/metric
CREATE OR REPLACE FUNCTION public._increment_mission_progress(_user_id UUID, _metric TEXT, _delta INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m RECORD;
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;
  FOR m IN
    SELECT id, target FROM public.seasonal_missions
    WHERE is_active = true AND metric = _metric AND now() BETWEEN starts_at AND ends_at
  LOOP
    INSERT INTO public.user_mission_progress (user_id, mission_id, progress)
    VALUES (_user_id, m.id, LEAST(_delta, m.target))
    ON CONFLICT (user_id, mission_id) DO UPDATE
      SET progress = LEAST(public.user_mission_progress.progress + _delta, m.target),
          updated_at = now()
      WHERE public.user_mission_progress.claimed_at IS NULL;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  -- never break the originating action
  RETURN;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._increment_mission_progress(UUID, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;

-- Triggers to feed progress from existing tables
CREATE OR REPLACE FUNCTION public.tg_mission_post_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._increment_mission_progress(NEW.user_id, 'post_created', 1);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_mission_post_commented()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._increment_mission_progress(NEW.user_id, 'post_commented', 1);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_mission_hashtag_used()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT user_id INTO v_uid FROM public.posts WHERE id = NEW.post_id;
  IF v_uid IS NOT NULL THEN
    PERFORM public._increment_mission_progress(v_uid, 'hashtag_used', 1);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_mission_post_created ON public.posts;
CREATE TRIGGER trg_mission_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_mission_post_created();

DROP TRIGGER IF EXISTS trg_mission_post_commented ON public.post_comments;
CREATE TRIGGER trg_mission_post_commented
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.tg_mission_post_commented();

DROP TRIGGER IF EXISTS trg_mission_hashtag_used ON public.post_hashtags;
CREATE TRIGGER trg_mission_hashtag_used
  AFTER INSERT ON public.post_hashtags
  FOR EACH ROW EXECUTE FUNCTION public.tg_mission_hashtag_used();

-- event_attendees may or may not exist; guarded
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='event_attendees') THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.tg_mission_event_attended()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $body$
      BEGIN
        PERFORM public._increment_mission_progress(NEW.user_id, 'event_attended', 1);
        RETURN NEW;
      END; $body$;
    $f$;
    EXECUTE 'DROP TRIGGER IF EXISTS trg_mission_event_attended ON public.event_attendees';
    EXECUTE 'CREATE TRIGGER trg_mission_event_attended AFTER INSERT ON public.event_attendees FOR EACH ROW EXECUTE FUNCTION public.tg_mission_event_attended()';
  END IF;
END $$;

-- Public RPCs
CREATE OR REPLACE FUNCTION public.get_user_mission_progress()
RETURNS TABLE (
  mission_id UUID,
  season TEXT,
  emoji TEXT,
  title TEXT,
  description TEXT,
  metric TEXT,
  target INTEGER,
  reward_label TEXT,
  xp_reward INTEGER,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  progress INTEGER,
  claimed_at TIMESTAMPTZ,
  is_complete BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sm.id,
    sm.season,
    sm.emoji,
    sm.title,
    sm.description,
    sm.metric,
    sm.target,
    sm.reward_label,
    sm.xp_reward,
    sm.starts_at,
    sm.ends_at,
    COALESCE(ump.progress, 0) AS progress,
    ump.claimed_at,
    COALESCE(ump.progress, 0) >= sm.target AS is_complete
  FROM public.seasonal_missions sm
  LEFT JOIN public.user_mission_progress ump
    ON ump.mission_id = sm.id AND ump.user_id = auth.uid()
  WHERE sm.is_active = true AND now() BETWEEN sm.starts_at AND sm.ends_at
  ORDER BY sm.created_at;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_mission_progress() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_mission_progress() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_mission_reward(_mission_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_mission RECORD;
  v_progress RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_mission FROM public.seasonal_missions
    WHERE id = _mission_id AND is_active = true AND now() BETWEEN starts_at AND ends_at;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'mission_not_active');
  END IF;

  SELECT * INTO v_progress FROM public.user_mission_progress
    WHERE user_id = v_uid AND mission_id = _mission_id;

  IF NOT FOUND OR v_progress.progress < v_mission.target THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_completed');
  END IF;

  IF v_progress.claimed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END IF;

  UPDATE public.user_mission_progress
    SET claimed_at = now(), updated_at = now()
    WHERE user_id = v_uid AND mission_id = _mission_id;

  -- Award XP via existing helper if available
  BEGIN
    PERFORM public.add_user_points(v_uid, v_mission.xp_reward, 'seasonal_mission', _mission_id::text);
  EXCEPTION WHEN undefined_function THEN
    -- fallback: bump user_points directly
    INSERT INTO public.user_points (user_id, total_points)
      VALUES (v_uid, v_mission.xp_reward)
      ON CONFLICT (user_id) DO UPDATE SET total_points = public.user_points.total_points + v_mission.xp_reward;
  END;

  RETURN jsonb_build_object('success', true, 'xp_awarded', v_mission.xp_reward, 'reward', v_mission.reward_label);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_mission_reward(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_mission_reward(UUID) TO authenticated;

-- Seed 5 active summer missions (90-day window)
INSERT INTO public.seasonal_missions (season, emoji, title, description, metric, target, reward_label, xp_reward, ends_at)
VALUES
  ('summer', '📸', 'Summer Snapshot', 'Post 10 photos this season', 'photo_uploaded', 10, '☀️ Summer Photographer Badge', 300, now() + interval '90 days'),
  ('summer', '🏖️', 'Beach Vibes', 'Use 5 seasonal hashtags', 'hashtag_used', 5, '🏖️ Beach Explorer Badge', 150, now() + interval '90 days'),
  ('summer', '🎆', 'Festival Star', 'Attend 3 community events', 'event_attended', 3, '🎆 Festival VIP Badge', 500, now() + interval '90 days'),
  ('summer', '🌊', 'Wave Rider', 'Create 14 posts during summer', 'post_created', 14, '🌊 Wave Rider Badge', 750, now() + interval '90 days'),
  ('summer', '🍹', 'Social Mixer', 'Comment on 50 posts', 'post_commented', 50, '🍹 Social Butterfly Badge', 200, now() + interval '90 days')
ON CONFLICT DO NOTHING;