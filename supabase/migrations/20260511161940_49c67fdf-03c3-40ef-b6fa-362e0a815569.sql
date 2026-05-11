
CREATE TABLE IF NOT EXISTS public.iq_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  reward_credits INT NOT NULL DEFAULT 5,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily challenges"
ON public.iq_daily_challenges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage daily challenges"
ON public.iq_daily_challenges FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.iq_daily_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.iq_daily_challenges(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  answer_index INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  reward_granted INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_iq_daily_attempts_user_date ON public.iq_daily_attempts(user_id, challenge_date DESC);

ALTER TABLE public.iq_daily_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
ON public.iq_daily_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
ON public.iq_daily_attempts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_today_iq_challenge()
RETURNS TABLE (
  id UUID,
  challenge_date DATE,
  question TEXT,
  options JSONB,
  reward_credits INT,
  difficulty TEXT,
  already_attempted BOOLEAN,
  was_correct BOOLEAN
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
  SELECT
    c.id,
    c.challenge_date,
    c.question,
    c.options,
    c.reward_credits,
    c.difficulty,
    EXISTS(SELECT 1 FROM public.iq_daily_attempts a WHERE a.challenge_id = c.id AND a.user_id = _uid) AS already_attempted,
    COALESCE((SELECT a.is_correct FROM public.iq_daily_attempts a WHERE a.challenge_id = c.id AND a.user_id = _uid LIMIT 1), false) AS was_correct
  FROM public.iq_daily_challenges c
  WHERE c.challenge_date = CURRENT_DATE
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_today_iq_challenge() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_iq_daily(_challenge_id UUID, _answer_index INT)
RETURNS TABLE (
  success BOOLEAN,
  is_correct BOOLEAN,
  reward INT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _challenge RECORD;
  _correct BOOLEAN;
  _reward INT := 0;
BEGIN
  IF _uid IS NULL THEN
    RETURN QUERY SELECT false, false, 0, 'Not authenticated'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO _challenge FROM public.iq_daily_challenges WHERE id = _challenge_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, 0, 'Challenge not found'::TEXT;
    RETURN;
  END IF;

  IF _challenge.challenge_date <> CURRENT_DATE THEN
    RETURN QUERY SELECT false, false, 0, 'Challenge expired'::TEXT;
    RETURN;
  END IF;

  IF EXISTS(SELECT 1 FROM public.iq_daily_attempts WHERE user_id = _uid AND challenge_id = _challenge_id) THEN
    RETURN QUERY SELECT false, false, 0, 'Already attempted'::TEXT;
    RETURN;
  END IF;

  _correct := (_answer_index = _challenge.correct_index);
  IF _correct THEN
    _reward := _challenge.reward_credits;
    INSERT INTO public.iq_credits (user_id, balance)
    VALUES (_uid, _reward)
    ON CONFLICT (user_id) DO UPDATE SET balance = iq_credits.balance + EXCLUDED.balance, updated_at = now();
  END IF;

  INSERT INTO public.iq_daily_attempts (user_id, challenge_id, challenge_date, answer_index, is_correct, reward_granted)
  VALUES (_uid, _challenge_id, _challenge.challenge_date, _answer_index, _correct, _reward);

  RETURN QUERY SELECT true, _correct, _reward,
    CASE WHEN _correct THEN 'Correct! +' || _reward || ' credits' ELSE 'Try again tomorrow' END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_iq_daily(UUID, INT) TO authenticated;
