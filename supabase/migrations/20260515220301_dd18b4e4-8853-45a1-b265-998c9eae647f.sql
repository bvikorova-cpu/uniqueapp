
-- Brackets
CREATE TABLE public.megatalent_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  week_start DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | completed
  current_round INT NOT NULL DEFAULT 1,
  rounds_total INT NOT NULL DEFAULT 3,
  winner_submission_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, week_start)
);

CREATE TABLE public.megatalent_bracket_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id UUID NOT NULL REFERENCES public.megatalent_brackets(id) ON DELETE CASCADE,
  round INT NOT NULL,
  match_index INT NOT NULL,
  submission_a_id UUID,
  submission_b_id UUID,
  votes_a INT NOT NULL DEFAULT 0,
  votes_b INT NOT NULL DEFAULT 0,
  winner_submission_id UUID,
  status TEXT NOT NULL DEFAULT 'open', -- open | closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bracket_id, round, match_index)
);

CREATE TABLE public.megatalent_bracket_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.megatalent_bracket_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  voted_for TEXT NOT NULL CHECK (voted_for IN ('a','b')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

CREATE INDEX idx_mt_bracket_matches_bracket ON public.megatalent_bracket_matches(bracket_id, round);
CREATE INDEX idx_mt_bracket_votes_match ON public.megatalent_bracket_votes(match_id);

ALTER TABLE public.megatalent_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megatalent_bracket_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megatalent_bracket_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brackets public read" ON public.megatalent_brackets FOR SELECT USING (true);
CREATE POLICY "brackets admin all" ON public.megatalent_brackets FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "bracket matches public read" ON public.megatalent_bracket_matches FOR SELECT USING (true);
CREATE POLICY "bracket matches admin all" ON public.megatalent_bracket_matches FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "bracket votes self insert" ON public.megatalent_bracket_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bracket votes self read" ON public.megatalent_bracket_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bracket votes admin read" ON public.megatalent_bracket_votes FOR SELECT USING (has_role(auth.uid(),'admin'));

-- Generate bracket for the current week
CREATE OR REPLACE FUNCTION public.generate_megatalent_bracket(_category TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week DATE := date_trunc('week', now())::date;
  v_bracket_id UUID;
  v_subs UUID[];
  i INT;
BEGIN
  SELECT id INTO v_bracket_id FROM megatalent_brackets WHERE category=_category AND week_start=v_week;
  IF v_bracket_id IS NOT NULL THEN
    RETURN v_bracket_id;
  END IF;

  SELECT array_agg(id ORDER BY votes_count DESC) INTO v_subs
  FROM (
    SELECT id, votes_count FROM talent_submissions
    WHERE category::text = _category AND is_active = true
    ORDER BY votes_count DESC LIMIT 8
  ) t;

  IF v_subs IS NULL OR array_length(v_subs,1) < 4 THEN
    RETURN NULL;
  END IF;

  INSERT INTO megatalent_brackets(category, week_start, rounds_total, current_round, status)
  VALUES (_category, v_week, CASE WHEN array_length(v_subs,1) >= 8 THEN 3 ELSE 2 END, 1, 'active')
  RETURNING id INTO v_bracket_id;

  -- Create round 1 matches: 1v8, 4v5, 3v6, 2v7 for 8; 1v4, 2v3 for 4
  IF array_length(v_subs,1) >= 8 THEN
    INSERT INTO megatalent_bracket_matches(bracket_id, round, match_index, submission_a_id, submission_b_id) VALUES
      (v_bracket_id,1,0,v_subs[1],v_subs[8]),
      (v_bracket_id,1,1,v_subs[4],v_subs[5]),
      (v_bracket_id,1,2,v_subs[3],v_subs[6]),
      (v_bracket_id,1,3,v_subs[2],v_subs[7]);
  ELSE
    INSERT INTO megatalent_bracket_matches(bracket_id, round, match_index, submission_a_id, submission_b_id) VALUES
      (v_bracket_id,1,0,v_subs[1],v_subs[4]),
      (v_bracket_id,1,1,v_subs[2],v_subs[3]);
  END IF;

  RETURN v_bracket_id;
END;
$$;

-- Advance: close current round, set winners, generate next round
CREATE OR REPLACE FUNCTION public.advance_megatalent_bracket(_bracket_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round INT;
  v_total INT;
  m RECORD;
  v_winners UUID[];
  v_count INT := 0;
  i INT;
BEGIN
  SELECT current_round, rounds_total INTO v_round, v_total
  FROM megatalent_brackets WHERE id=_bracket_id;

  -- Resolve current round
  FOR m IN SELECT * FROM megatalent_bracket_matches
           WHERE bracket_id=_bracket_id AND round=v_round AND status='open'
           ORDER BY match_index
  LOOP
    UPDATE megatalent_bracket_matches
    SET status='closed',
        winner_submission_id = CASE
          WHEN m.votes_a > m.votes_b THEN m.submission_a_id
          WHEN m.votes_b > m.votes_a THEN m.submission_b_id
          ELSE (ARRAY[m.submission_a_id, m.submission_b_id])[1 + floor(random()*2)::int]
        END
    WHERE id = m.id;
  END LOOP;

  -- Collect winners in match_index order
  SELECT array_agg(winner_submission_id ORDER BY match_index) INTO v_winners
  FROM megatalent_bracket_matches
  WHERE bracket_id=_bracket_id AND round=v_round;

  IF v_round >= v_total THEN
    UPDATE megatalent_brackets
    SET status='completed', winner_submission_id = v_winners[1], updated_at=now()
    WHERE id=_bracket_id;
    RETURN jsonb_build_object('completed', true, 'winner', v_winners[1]);
  END IF;

  -- Generate next round
  i := 0;
  WHILE i < array_length(v_winners,1) LOOP
    INSERT INTO megatalent_bracket_matches(bracket_id, round, match_index, submission_a_id, submission_b_id)
    VALUES (_bracket_id, v_round+1, i/2, v_winners[i+1], v_winners[i+2]);
    i := i + 2;
  END LOOP;

  UPDATE megatalent_brackets SET current_round = v_round+1, updated_at=now() WHERE id=_bracket_id;
  RETURN jsonb_build_object('advanced_to', v_round+1);
END;
$$;

-- Public read of full bracket with submissions
CREATE OR REPLACE FUNCTION public.get_megatalent_bracket(_category TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bracket RECORD;
  v_matches JSONB;
BEGIN
  SELECT * INTO v_bracket FROM megatalent_brackets
  WHERE category=_category
  ORDER BY week_start DESC LIMIT 1;

  IF v_bracket IS NULL THEN RETURN NULL; END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id', m.id,
    'round', m.round,
    'match_index', m.match_index,
    'votes_a', m.votes_a,
    'votes_b', m.votes_b,
    'status', m.status,
    'winner_submission_id', m.winner_submission_id,
    'submission_a', (SELECT jsonb_build_object('id', s.id, 'title', s.title, 'media_url', s.media_url, 'media_type', s.media_type) FROM talent_submissions s WHERE s.id = m.submission_a_id),
    'submission_b', (SELECT jsonb_build_object('id', s.id, 'title', s.title, 'media_url', s.media_url, 'media_type', s.media_type) FROM talent_submissions s WHERE s.id = m.submission_b_id)
  ) ORDER BY m.round, m.match_index) INTO v_matches
  FROM megatalent_bracket_matches m WHERE m.bracket_id = v_bracket.id;

  RETURN jsonb_build_object(
    'id', v_bracket.id,
    'category', v_bracket.category,
    'week_start', v_bracket.week_start,
    'status', v_bracket.status,
    'current_round', v_bracket.current_round,
    'rounds_total', v_bracket.rounds_total,
    'winner_submission_id', v_bracket.winner_submission_id,
    'matches', COALESCE(v_matches, '[]'::jsonb)
  );
END;
$$;
