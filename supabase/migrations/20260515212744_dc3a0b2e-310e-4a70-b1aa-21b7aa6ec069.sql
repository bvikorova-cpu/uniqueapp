-- Daily challenges table
CREATE TABLE public.megatalent_daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🎯',
  challenge_type text NOT NULL, -- 'upload_count', 'votes_received', 'comments_left', 'tips_sent', 'category_diversity'
  requirement_value integer NOT NULL DEFAULT 1,
  bonus_votes integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.megatalent_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON public.megatalent_daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage challenges"
  ON public.megatalent_daily_challenges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Completions table
CREATE TABLE public.megatalent_challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.megatalent_daily_challenges(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  bonus_votes_awarded integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.megatalent_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_megatalent_completions_user ON public.megatalent_challenge_completions(user_id);
CREATE INDEX idx_megatalent_completions_challenge ON public.megatalent_challenge_completions(challenge_id);

CREATE POLICY "Users can view their own completions"
  ON public.megatalent_challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions"
  ON public.megatalent_challenge_completions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Generator function: deterministic daily challenge from pool
CREATE OR REPLACE FUNCTION public.generate_megatalent_daily_challenge()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date := CURRENT_DATE;
  _existing_id uuid;
  _new_id uuid;
  _pool jsonb := '[
    {"title":"Upload Day","description":"Upload 1 new performance today","icon":"🎬","type":"upload_count","req":1,"bonus":150},
    {"title":"Vote Magnet","description":"Receive 50 votes on your submissions","icon":"⭐","type":"votes_received","req":50,"bonus":200},
    {"title":"Community Voice","description":"Leave 5 comments on other performances","icon":"💬","type":"comments_left","req":5,"bonus":100},
    {"title":"Generous Fan","description":"Send a tip to a creator","icon":"🎁","type":"tips_sent","req":1,"bonus":120},
    {"title":"Category Explorer","description":"Vote in 3 different categories","icon":"🌈","type":"category_diversity","req":3,"bonus":100},
    {"title":"Double Drop","description":"Upload 2 performances today","icon":"🔥","type":"upload_count","req":2,"bonus":250},
    {"title":"Viral Push","description":"Receive 100 votes today","icon":"🚀","type":"votes_received","req":100,"bonus":300}
  ]'::jsonb;
  _pick jsonb;
  _idx int;
BEGIN
  SELECT id INTO _existing_id
  FROM public.megatalent_daily_challenges
  WHERE challenge_date = _today;

  IF _existing_id IS NOT NULL THEN
    RETURN _existing_id;
  END IF;

  _idx := (extract(doy FROM _today)::int % jsonb_array_length(_pool));
  _pick := _pool -> _idx;

  INSERT INTO public.megatalent_daily_challenges
    (challenge_date, title, description, icon, challenge_type, requirement_value, bonus_votes)
  VALUES (
    _today,
    _pick->>'title',
    _pick->>'description',
    _pick->>'icon',
    _pick->>'type',
    (_pick->>'req')::int,
    (_pick->>'bonus')::int
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

-- Progress lookup
CREATE OR REPLACE FUNCTION public.get_megatalent_challenge_progress(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _challenge public.megatalent_daily_challenges%ROWTYPE;
  _progress int := 0;
  _completed boolean := false;
  _today date := CURRENT_DATE;
BEGIN
  SELECT * INTO _challenge
  FROM public.megatalent_daily_challenges
  WHERE challenge_date = _today;

  IF _challenge.id IS NULL THEN
    RETURN jsonb_build_object('challenge', null);
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.megatalent_challenge_completions
    WHERE user_id = _user_id AND challenge_id = _challenge.id
  ) INTO _completed;

  IF _user_id IS NOT NULL THEN
    CASE _challenge.challenge_type
      WHEN 'upload_count' THEN
        SELECT count(*)::int INTO _progress
        FROM public.megatalent_submissions
        WHERE user_id = _user_id AND created_at::date = _today;
      WHEN 'votes_received' THEN
        SELECT COALESCE(count(v.*), 0)::int INTO _progress
        FROM public.megatalent_votes v
        JOIN public.megatalent_submissions s ON s.id = v.submission_id
        WHERE s.user_id = _user_id AND v.created_at::date = _today;
      WHEN 'tips_sent' THEN
        SELECT count(*)::int INTO _progress
        FROM public.megatalent_tips
        WHERE tipper_id = _user_id AND status = 'completed' AND completed_at::date = _today;
      ELSE
        _progress := 0;
    END CASE;
  END IF;

  RETURN jsonb_build_object(
    'challenge', row_to_json(_challenge),
    'progress', _progress,
    'completed', _completed
  );
EXCEPTION WHEN undefined_table THEN
  RETURN jsonb_build_object(
    'challenge', row_to_json(_challenge),
    'progress', 0,
    'completed', _completed
  );
END;
$$;