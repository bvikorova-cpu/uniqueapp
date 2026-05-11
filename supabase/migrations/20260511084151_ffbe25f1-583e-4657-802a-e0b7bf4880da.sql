
CREATE TABLE IF NOT EXISTS public.iq_test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  question_ids uuid[] NOT NULL,
  credits_spent int NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.iq_test_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "iq_sessions_owner_select" ON public.iq_test_sessions;
DROP POLICY IF EXISTS "iq_sessions_owner_insert" ON public.iq_test_sessions;
DROP POLICY IF EXISTS "iq_sessions_owner_update" ON public.iq_test_sessions;
CREATE POLICY "iq_sessions_owner_select" ON public.iq_test_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "iq_sessions_owner_insert" ON public.iq_test_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "iq_sessions_owner_update" ON public.iq_test_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public._iq_test_config(_category text)
RETURNS TABLE(qcount int, credits int, diff text, only_category text)
LANGUAGE sql IMMUTABLE AS $$
  SELECT t.qcount, t.credits, t.diff, t.only_category FROM (VALUES
    ('beginner',     20, 10, 'easy'::text,   NULL::text),
    ('intermediate', 25, 15, 'medium',       NULL),
    ('advanced',     30, 20, 'hard',         NULL),
    ('expert',       30, 25, 'expert',       NULL),
    ('logical',      15,  8, NULL,           'logical'),
    ('spatial',      15,  8, NULL,           'spatial'),
    ('verbal',       15,  8, NULL,           'verbal'),
    ('numerical',    15,  8, NULL,           'numerical'),
    ('memory',       15,  8, NULL,           'memory'),
    ('pattern',      15,  8, NULL,           'pattern')
  ) AS t(cat, qcount, credits, diff, only_category)
  WHERE t.cat = _category;
$$;

-- erf polyfill (Abramowitz & Stegun)
CREATE OR REPLACE FUNCTION public.erf(x numeric)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  a1 numeric := 0.254829592; a2 numeric := -0.284496736; a3 numeric := 1.421413741;
  a4 numeric := -1.453152027; a5 numeric := 1.061405429; p numeric := 0.3275911;
  s int; ax numeric; t numeric; y numeric;
BEGIN
  s := CASE WHEN x < 0 THEN -1 ELSE 1 END;
  ax := abs(x);
  t := 1 / (1 + p * ax);
  y := 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * exp(-ax*ax);
  RETURN s * y;
END $$;

CREATE OR REPLACE FUNCTION public.start_iq_test(_category text)
RETURNS TABLE(session_id uuid, questions jsonb, credits_spent int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cfg record;
  v_ids uuid[];
  v_session uuid;
  v_questions jsonb;
  v_balance int;
  v_cooldown bigint;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO v_cfg FROM public._iq_test_config(_category);
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_category'; END IF;

  BEGIN
    v_cooldown := public.iq_test_cooldown_remaining(_category);
  EXCEPTION WHEN OTHERS THEN v_cooldown := 0; END;
  IF v_cooldown > 0 THEN RAISE EXCEPTION 'cooldown_active'; END IF;

  SELECT balance INTO v_balance FROM public.iq_credits WHERE user_id = v_uid;
  IF v_balance IS NULL OR v_balance < v_cfg.credits THEN RAISE EXCEPTION 'insufficient_credits'; END IF;
  UPDATE public.iq_credits SET balance = balance - v_cfg.credits, updated_at = now() WHERE user_id = v_uid;

  SELECT array_agg(id) INTO v_ids FROM (
    SELECT id FROM public.iq_questions
    WHERE (v_cfg.diff IS NULL OR difficulty = v_cfg.diff)
      AND (v_cfg.only_category IS NULL OR category = v_cfg.only_category)
    ORDER BY random() LIMIT v_cfg.qcount
  ) q;
  IF v_ids IS NULL OR array_length(v_ids,1) < 5 THEN
    SELECT array_agg(id) INTO v_ids FROM (SELECT id FROM public.iq_questions ORDER BY random() LIMIT v_cfg.qcount) q;
  END IF;

  INSERT INTO public.iq_test_sessions(user_id, category, question_ids, credits_spent)
  VALUES (v_uid, _category, v_ids, v_cfg.credits)
  RETURNING id INTO v_session;

  SELECT jsonb_agg(jsonb_build_object(
    'id', q.id, 'question', q.question,
    'option_a', q.option_a, 'option_b', q.option_b,
    'option_c', q.option_c, 'option_d', q.option_d,
    'category', q.category, 'difficulty', q.difficulty
  ) ORDER BY array_position(v_ids, q.id))
  INTO v_questions
  FROM public.iq_questions q WHERE q.id = ANY(v_ids);

  RETURN QUERY SELECT v_session, v_questions, v_cfg.credits;
END $$;

CREATE OR REPLACE FUNCTION public.submit_iq_test(_session_id uuid, _answers jsonb, _time_taken int DEFAULT 0)
RETURNS TABLE(iq_score int, correct int, total int, percentile numeric, sub_scores jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session record;
  v_correct int := 0;
  v_total int := 0;
  v_iq int;
  v_diff_bonus int := 0;
  v_subs jsonb := '{}'::jsonb;
  v_pct numeric;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO v_session FROM public.iq_test_sessions WHERE id = _session_id AND user_id = v_uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'session_not_found'; END IF;
  IF v_session.status = 'completed' THEN RAISE EXCEPTION 'already_submitted'; END IF;

  SELECT count(*)::int, count(*) FILTER (WHERE is_correct)::int
  INTO v_total, v_correct
  FROM (
    SELECT (lower(coalesce(_answers->>q.id::text, '')) = lower(q.correct_answer)) AS is_correct
    FROM public.iq_questions q WHERE q.id = ANY(v_session.question_ids)
  ) g;

  SELECT jsonb_object_agg(category, round(100.0 * c::numeric / NULLIF(n,0)))
  INTO v_subs
  FROM (
    SELECT q.category,
           sum(CASE WHEN lower(coalesce(_answers->>q.id::text,'')) = lower(q.correct_answer) THEN 1 ELSE 0 END) AS c,
           count(*) AS n
    FROM public.iq_questions q WHERE q.id = ANY(v_session.question_ids)
    GROUP BY q.category
  ) s;

  SELECT CASE
    WHEN v_session.category = 'expert' THEN 15
    WHEN v_session.category = 'advanced' THEN 10
    WHEN v_session.category = 'intermediate' THEN 5
    ELSE 0 END INTO v_diff_bonus;

  v_iq := GREATEST(60, LEAST(170,
    round(70 + (v_correct::numeric / NULLIF(v_total,0)) * 70 + v_diff_bonus)::int
  ));
  v_pct := round((100 * (0.5 * (1 + public.erf((v_iq - 100)::numeric / (15 * sqrt(2)::numeric)))))::numeric, 2);

  INSERT INTO public.iq_test_results(
    user_id, score, iq_score, time_taken, category, sub_scores,
    total_questions, correct_count, percentile, answers
  ) VALUES (
    v_uid, round(100.0 * v_correct / NULLIF(v_total,0))::int,
    v_iq, _time_taken, v_session.category, v_subs,
    v_total, v_correct, v_pct, _answers
  );

  UPDATE public.iq_test_sessions SET status='completed', completed_at=now() WHERE id = _session_id;

  RETURN QUERY SELECT v_iq, v_correct, v_total, v_pct, v_subs;
END $$;

-- Seed questions if pool is empty
INSERT INTO public.iq_questions(question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, time_limit)
SELECT * FROM (VALUES
('All roses are flowers. Some flowers fade quickly. Therefore:','All roses fade quickly','Some roses may fade quickly','No roses fade quickly','All flowers are roses','b','medium','logical',45),
('If A>B and B>C, then:','A<C','A=C','A>C','Cannot be determined','c','easy','logical',30),
('Which does NOT belong: dog, cat, lion, rose?','dog','cat','lion','rose','d','easy','logical',30),
('Some Bloops are Razzies. All Razzies are Lazzies. So:','Some Bloops are Lazzies','All Bloops are Lazzies','No Bloops are Lazzies','None','a','medium','logical',45),
('If today is Tuesday, day after tomorrow is:','Wednesday','Thursday','Friday','Monday','b','easy','logical',30),
('Statement: Books are not papers. Conclusion?','Some books are papers','No book is a paper','All papers are books','None','b','medium','logical',45),
('John is taller than Mike. Mike is taller than Sam. Tallest is:','Sam','Mike','John','Equal','c','easy','logical',30),
('If all X are Y, and no Y is Z, then:','Some X is Z','No X is Z','All X is Z','None','b','expert','logical',60),
('Either A or B is true, but not both. A is false. B is:','False','True','Unknown','Both','b','medium','logical',45),
('Negation of "All cars are fast":','No car is fast','Some cars are not fast','All cars are slow','None','b','expert','logical',60),
('A cube has how many edges?','6','8','12','24','c','easy','spatial',30),
('Rotate "b" 180 degrees around horizontal axis. Result:','d','q','p','b','b','medium','spatial',45),
('How many faces does a tetrahedron have?','3','4','5','6','b','easy','spatial',30),
('Mirror image of "E" is:','3','W','M','Backwards E','d','easy','spatial',30),
('A clock at 3:00, angle between hands?','60','90','120','180','b','easy','spatial',30),
('Unfolded cube has how many squares?','4','5','6','8','c','easy','spatial',30),
('Smallest number of colors to color a map (4-color theorem)?','3','4','5','6','b','medium','spatial',45),
('A square is rotated 45 degrees. New shape called:','Square','Diamond','Rhombus','Rectangle','b','easy','spatial',30),
('How many right angles in a regular hexagon vertex?','0','1','2','3','a','medium','spatial',45),
('A 3x3x3 cube cut into 1x1x1 cubes. How many small cubes?','9','18','27','36','c','medium','spatial',45),
('Choose synonym of "Benevolent":','Cruel','Kind','Wealthy','Sad','b','easy','verbal',30),
('Antonym of "Abundant":','Plentiful','Scarce','Rich','Full','b','easy','verbal',30),
('Doctor is to Hospital as Teacher is to:','Student','School','Book','Class','b','easy','verbal',30),
('Choose the odd one: rapid, quick, slow, swift','rapid','quick','slow','swift','c','easy','verbal',30),
('Synonym of "Ephemeral":','Eternal','Brief','Solid','Heavy','b','medium','verbal',45),
('"Pen" is to "Write" as "Knife" is to:','Sharp','Cut','Steel','Kitchen','b','easy','verbal',30),
('Antonym of "Loquacious":','Talkative','Reserved','Loud','Curious','b','hard','verbal',60),
('Sycophant most nearly means:','Critic','Flatterer','Leader','Rebel','b','hard','verbal',60),
('Which word is misspelled? "Recieve, Believe, Achieve, Niece"','Recieve','Believe','Achieve','Niece','a','easy','verbal',30),
('Choose closest in meaning to "Ubiquitous":','Rare','Everywhere','Hidden','Powerful','b','medium','verbal',45),
('2,4,8,16,?','24','30','32','64','c','easy','numerical',30),
('What is 15% of 200?','20','25','30','35','c','easy','numerical',30),
('1,1,2,3,5,8,?','11','13','12','15','b','easy','numerical',30),
('Sum of first 10 positive integers?','45','50','55','100','c','easy','numerical',30),
('If 3x+5=20, x=?','3','5','7','15','b','easy','numerical',30),
('100,50,25,12.5,?','5','6.25','10','7.5','b','medium','numerical',45),
('Square root of 144?','11','12','13','14','b','easy','numerical',30),
('2^10 = ?','512','1024','2048','256','b','easy','numerical',30),
('A train travels 60 km in 45 min. Speed in km/h?','60','75','80','90','c','medium','numerical',45),
('Sequence: 3,7,15,31,?','47','55','63','71','c','expert','numerical',60),
('Memorize: 7,2,9,4. Reverse it.','9,7,4,2','4,9,2,7','2,4,9,7','4,2,9,7','b','easy','memory',30),
('Sequence A,C,E,G — next letter?','H','I','J','K','b','easy','memory',30),
('First letter of every word in "Cats Always Bring Joy" — spell:','CABJ','CABS','CAJB','BACK','a','easy','memory',30),
('Memorize numbers 8,3,5. What is sum?','15','16','14','13','b','easy','memory',30),
('Days of week starting with T?','Tuesday only','Tuesday, Thursday','Thursday only','Three','b','easy','memory',30),
('Which is the 3rd month?','February','March','April','May','b','easy','memory',30),
('Recite back: M,K,P,R. Which is 2nd?','M','K','P','R','b','easy','memory',30),
('Sequence 1,3,6,10,15 — next?','18','20','21','25','c','medium','memory',45),
('Word list: apple, river, chair. Which is furniture?','apple','river','chair','none','c','easy','memory',30),
('Capitals: Paris, Tokyo, Lima. Which is in Peru?','Paris','Tokyo','Lima','None','c','easy','memory',30),
('Pattern: triangle circle square triangle circle square triangle ?','square','circle','triangle','diamond','b','easy','pattern',30),
('Which completes: AB, CD, EF, ?','GH','HI','FG','GI','a','easy','pattern',30),
('2,6,12,20,30,?','40','42','44','46','b','medium','pattern',45),
('Which is the odd shape: circle, square, triangle, sphere?','circle','square','triangle','sphere','d','easy','pattern',30),
('Pattern: 1,4,9,16,?','20','24','25','30','c','easy','pattern',30),
('Letters: Z Y X W ?','U','V','T','S','b','easy','pattern',30),
('What comes next: 81,27,9,3,?','0','1','2','3','b','medium','pattern',45),
('Series: 5,11,23,47,?','71','83','95','99','c','expert','pattern',60),
('Mirror sequence: 1,2,3,3,2,?','1','2','3','4','a','easy','pattern',30),
('Sequence: J,F,M,A,M,J,?','J','A','S','O','a','medium','pattern',45)
) AS s(question,a,b,c,d,ans,diff,cat,tl)
WHERE NOT EXISTS (SELECT 1 FROM public.iq_questions LIMIT 1);
