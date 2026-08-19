-- 1) Normalize legacy category names
UPDATE public.iq_questions SET category = CASE category
  WHEN 'patterns' THEN 'pattern'
  WHEN 'shapes' THEN 'spatial'
  WHEN 'geometry' THEN 'spatial'
  WHEN 'math' THEN 'numerical'
  WHEN 'algebra' THEN 'numerical'
  WHEN 'probability' THEN 'numerical'
  WHEN 'combinatorics' THEN 'numerical'
  WHEN 'logic' THEN 'logical'
  WHEN 'coding' THEN 'logical'
  WHEN 'analogy' THEN 'verbal'
  WHEN 'anagrams' THEN 'verbal'
  WHEN 'classification' THEN 'verbal'
  WHEN 'vocabulary' THEN 'verbal'
  WHEN 'general' THEN 'verbal'
  ELSE category END;

-- 2) No duplicated question text anywhere
DELETE FROM public.iq_questions a USING public.iq_questions b
 WHERE a.ctid > b.ctid AND lower(btrim(a.question)) = lower(btrim(b.question));
CREATE UNIQUE INDEX IF NOT EXISTS iq_questions_question_uniq
  ON public.iq_questions (lower(btrim(question)));

-- 3) Helper to seed a question with shuffled option position
CREATE OR REPLACE FUNCTION public._iq_seed_q(_q text,_ans text,_d1 text,_d2 text,_d3 text,_diff text,_cat text,_k int)
RETURNS void LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE opts text[]; pos int; BEGIN
  pos := (_k % 4);
  opts := ARRAY[_d1,_d2,_d3];
  opts := opts[1:pos] || ARRAY[_ans] || opts[pos+1:3];
  IF (SELECT count(DISTINCT x) FROM unnest(opts) x) < 4 THEN RETURN; END IF;
  INSERT INTO public.iq_questions(question,option_a,option_b,option_c,option_d,correct_answer,difficulty,category)
  VALUES (_q,opts[1],opts[2],opts[3],opts[4],chr(65+pos),_diff,_cat)
  ON CONFLICT DO NOTHING;
END $$;

-- 4) Generated, difficulty-graded numerical + pattern questions
DO $$
DECLARE i int; a int; b int; s int; st int; r int; k int; base numeric; p int; fin numeric;
        seq int[]; ans int; q text; x int; j int;
BEGIN
  -- BEGINNER numerical: simple addition
  FOR i IN 1..20 LOOP
    a := 13 + i; b := 21 + i*2; ans := a + b;
    PERFORM public._iq_seed_q('What is '||a||' + '||b||'?', ans::text, (ans+3)::text, (ans-4)::text, (ans+11)::text, 'beginner','numerical', i);
  END LOOP;
  -- BEGINNER pattern: arithmetic progression
  FOR i IN 1..20 LOOP
    s := 2 + i; st := 2 + (i % 5); seq := ARRAY[]::int[];
    FOR j IN 0..4 LOOP seq := seq || (s + st*j); END LOOP;
    ans := seq[5] + st;
    PERFORM public._iq_seed_q('Which number comes next? '||array_to_string(seq,', ')||', ?', ans::text, (ans+1)::text, (ans-2)::text, (ans+7)::text,'beginner','pattern', i+1);
  END LOOP;
  -- INTERMEDIATE numerical: two-digit multiplication
  FOR i IN 1..20 LOOP
    a := 11 + i; b := 13 + i; ans := a * b;
    PERFORM public._iq_seed_q('What is '||a||' x '||b||'?', ans::text, (ans+9)::text, (ans-7)::text, (ans+21)::text,'intermediate','numerical', i+2);
  END LOOP;
  -- INTERMEDIATE pattern: geometric progression
  FOR i IN 1..20 LOOP
    s := 2 + (i % 5); r := 2 + (i % 3); seq := ARRAY[]::int[]; x := s;
    FOR j IN 1..4 LOOP seq := seq || x; x := x * r; END LOOP;
    ans := x;
    PERFORM public._iq_seed_q('Which number continues the sequence? '||array_to_string(seq,', ')||', ? (step '||i||')', ans::text, (ans+r)::text, (ans-r)::text, (ans*2)::text,'intermediate','pattern', i+3);
  END LOOP;
  -- ADVANCED numerical: successive percentage change
  FOR i IN 1..20 LOOP
    base := 200 + 10*i; p := 10 + i;
    fin := round(base * (1 + p/100.0) * 0.9, 2);
    PERFORM public._iq_seed_q('A value of '||base||' is increased by '||p||'% and then reduced by 10%. What is the result?',
      trim(to_char(fin,'FM999999990.00')), trim(to_char(fin+7.5,'FM999999990.00')), trim(to_char(fin-9.25,'FM999999990.00')), trim(to_char(base*(1+p/100.0),'FM999999990.00')),
      'advanced','numerical', i+1);
  END LOOP;
  -- ADVANCED pattern: Fibonacci-like recurrence
  FOR i IN 1..20 LOOP
    a := 1 + (i % 5); b := 2 + (i % 7); seq := ARRAY[a,b];
    FOR j IN 1..4 LOOP seq := seq || (seq[array_length(seq,1)] + seq[array_length(seq,1)-1]); END LOOP;
    ans := seq[array_length(seq,1)] + seq[array_length(seq,1)-1];
    PERFORM public._iq_seed_q('Each term is the sum of the two before it. Find the next term: '||array_to_string(seq,', ')||', ?', ans::text, (ans+3)::text, (ans-5)::text, (ans+13)::text,'advanced','pattern', i+2);
  END LOOP;
  -- EXPERT numerical: quadratic root
  FOR i IN 1..20 LOOP
    a := 3 + (i % 7); b := 11 + i;
    PERFORM public._iq_seed_q('Solve for x, where x is non-zero: '||a||'x^2 = '||(a*b)||'x', b::text, (b+2)::text, (b-3)::text, (a*b)::text,'expert','numerical', i+3);
  END LOOP;
  -- EXPERT pattern: multiply then add an increasing addend
  FOR i IN 1..20 LOOP
    s := 2 + (i % 5); k := 2 + (i % 4); seq := ARRAY[s]; x := s;
    FOR j IN 1..4 LOOP x := x * k + j; seq := seq || x; END LOOP;
    ans := x * k + 5;
    PERFORM public._iq_seed_q('The rule multiplies by a constant and adds a growing amount. What is the next term? '||array_to_string(seq,', ')||', ?', ans::text, (ans+k)::text, (ans-k-1)::text, (x*k)::text,'expert','pattern', i);
  END LOOP;
END $$;

-- 5) Hand-written, difficulty-graded logical / verbal / spatial / memory questions
INSERT INTO public.iq_questions(question,option_a,option_b,option_c,option_d,correct_answer,difficulty,category) VALUES
-- beginner logical
('All cats are animals. Fluffy is a cat. Therefore:','Fluffy is a dog','Fluffy is an animal','All animals are cats','Fluffy is not an animal','B','beginner','logical'),
('If today is Monday, what day will it be in 3 days?','Thursday','Wednesday','Friday','Tuesday','A','beginner','logical'),
('Which item does not belong: apple, banana, carrot, pear?','apple','banana','carrot','pear','C','beginner','logical'),
('Tom is taller than Ann. Ann is taller than Eva. Who is the shortest?','Tom','Ann','Eva','Cannot be known','C','beginner','logical'),
-- beginner verbal
('Hot is to cold as day is to:','sun','night','warm','noon','B','beginner','verbal'),
('Which word means the same as happy?','joyful','angry','tired','slow','A','beginner','verbal'),
('Unscramble the letters ELPPA to form a fruit:','PEARL','LAPSE','APPLE','PLEAS','C','beginner','verbal'),
('Bird is to nest as bee is to:','honey','flower','wing','hive','D','beginner','verbal'),
-- beginner spatial
('How many faces does a cube have?','4','6','8','12','B','beginner','spatial'),
('Which shape has no corners?','square','triangle','circle','hexagon','C','beginner','spatial'),
('You are facing north and turn right. Which direction do you face now?','east','west','south','north','A','beginner','spatial'),
('Turning a square by 90 degrees makes it look:','like a triangle','larger','the same','like a circle','C','beginner','spatial'),
-- beginner memory
('Read the digits 4 - 9 - 2, then repeat them backwards.','4 - 9 - 2','2 - 9 - 4','9 - 4 - 2','2 - 4 - 9','B','beginner','memory'),
('Remember RED, BLUE, GREEN. Which colour was second?','RED','GREEN','BLUE','YELLOW','C','beginner','memory'),
('Remember the list: cat, book, lamp. How many items were in it?','2','3','4','5','B','beginner','memory'),
('In the sequence 7 - 1 - 5, which number came first?','1','5','7','3','C','beginner','memory'),
-- intermediate logical
('Some doctors are runners. All runners are healthy. Which must be true?','All doctors are runners','Some doctors are healthy','No doctor is healthy','All healthy people are doctors','B','intermediate','logical'),
('Five people each shake hands once with everyone else. How many handshakes take place?','5','10','15','20','B','intermediate','logical'),
('A clock shows 3:15. What is the angle between the hands?','0 degrees','7.5 degrees','15 degrees','30 degrees','B','intermediate','logical'),
('If no X is Y and all Z are X, then:','all Z are Y','some Z are Y','no Z is Y','Y equals Z','C','intermediate','logical'),
-- intermediate verbal
('Ephemeral most nearly means:','eternal','short-lived','heavy','hidden','B','intermediate','verbal'),
('Author is to book as composer is to:','piano','audience','symphony','stage','C','intermediate','verbal'),
('Choose the antonym of abundant:','plentiful','ample','scarce','wide','C','intermediate','verbal'),
('Which word is closest in meaning to meticulous?','careless','careful','rapid','loud','B','intermediate','verbal'),
-- intermediate spatial
('A flat net of six equal squares folds into a:','pyramid','cube','cylinder','cone','B','intermediate','spatial'),
('How many vertices does a triangular prism have?','5','6','8','9','B','intermediate','spatial'),
('A painted cube is cut into 27 equal cubes. How many small cubes have exactly three painted faces?','4','6','8','12','C','intermediate','spatial'),
('Facing south, you turn left twice. Which direction do you face?','east','west','north','south','C','intermediate','spatial'),
-- intermediate memory
('Sequence 6 - 2 - 9 - 4. Report it backwards.','6 - 2 - 9 - 4','4 - 9 - 2 - 6','9 - 4 - 6 - 2','2 - 6 - 4 - 9','B','intermediate','memory'),
('List: TREE, RIVER, STONE, CLOUD. Which word was third?','RIVER','STONE','CLOUD','TREE','B','intermediate','memory'),
('Digits 5 - 3 - 8. Add the first and the last from memory.','11','13','16','8','B','intermediate','memory'),
('Pairs shown: dog-3, cat-7. Which number went with cat?','3','5','7','9','C','intermediate','memory'),
-- advanced logical
('In a group of 30 people, 18 play chess, 15 play go and everyone plays at least one game. How many play both?','2','3','5','7','B','advanced','logical'),
('If every P implies Q and Q implies not R, then P implies:','R','not R','Q only','nothing','B','advanced','logical'),
('Four runners finish a race: Ann beats Ben, Ben beats Cid, Dan beats Ann. Who finished second?','Ann','Ben','Cid','Dan','A','advanced','logical'),
('A conditional statement and its contrapositive are:','always opposite','logically equivalent','independent','both false','B','advanced','logical'),
-- advanced verbal
('Obfuscate most nearly means:','to clarify','to confuse deliberately','to praise','to postpone','B','advanced','verbal'),
('Sycophant is to flattery as pedant is to:','courage','silence','detail','chaos','C','advanced','verbal'),
('Choose the antonym of laconic:','brief','curt','verbose','terse','C','advanced','verbal'),
('Which pair is analogous to ameliorate : worsen?','mitigate : aggravate','begin : start','huge : large','fast : quick','A','advanced','verbal'),
-- advanced spatial
('A 4x4x4 painted cube is cut into unit cubes. How many have no painted face?','4','8','12','16','B','advanced','spatial'),
('How many diagonals does a regular octagon have?','16','20','24','28','B','advanced','spatial'),
('Reflecting a point across the x-axis and then the y-axis is equivalent to a rotation of:','45 degrees','90 degrees','180 degrees','270 degrees','C','advanced','spatial'),
('Two identical cubes are glued face to face. How many faces remain visible?','8','10','11','12','B','advanced','spatial'),
-- advanced memory
('Sequence 8 - 3 - 7 - 1 - 5. Report it backwards.','8 - 3 - 7 - 1 - 5','5 - 1 - 7 - 3 - 8','5 - 7 - 1 - 3 - 8','1 - 5 - 8 - 3 - 7','B','advanced','memory'),
('Pairs: blue-9, green-4, red-6. Sum the numbers shown for blue and red.','10','13','15','19','C','advanced','memory'),
('List: NORTH, WOLF, TIMBER, GLASS, ORBIT. Which word was fourth?','TIMBER','GLASS','ORBIT','WOLF','B','advanced','memory'),
('Digits 2 - 7 - 4 - 9. Report every second digit in order.','2 - 4','7 - 9','9 - 7','4 - 2','B','advanced','memory'),
-- expert logical
('On an island knights always tell the truth and knaves always lie. A says: We are both knaves. What is A?','a knight','a knave','undetermined','both','B','expert','logical'),
('Which statement is logically equivalent to not (P and Q)?','not P and not Q','not P or not Q','P or Q','P implies Q','B','expert','logical'),
('In the Monty Hall problem, switching doors wins with probability:','1/3','1/2','2/3','3/4','C','expert','logical'),
('A formula is a tautology when it is:','sometimes true','true under every valuation','never true','undecidable','B','expert','logical'),
-- expert verbal
('Tergiversate most nearly means:','to equivocate','to celebrate','to accelerate','to enumerate','A','expert','verbal'),
('Which pair is analogous to apostate : faith?','scholar : book','defector : allegiance','artisan : craft','pilot : plane','B','expert','verbal'),
('Supererogatory acts are those that are:','strictly forbidden','beyond what is required','legally required','morally neutral','B','expert','verbal'),
('Choose the antonym of inchoate:','rudimentary','nascent','fully formed','embryonic','C','expert','verbal'),
-- expert spatial
('How many distinct orientations of a cube exist using rotations only?','12','24','48','6','B','expert','spatial'),
('A Mobius strip has how many edges?','1','2','3','0','A','expert','spatial'),
('For any convex polyhedron, V - E + F equals:','0','1','2','4','C','expert','spatial'),
('A 5x5x5 painted cube is cut into unit cubes. How many have exactly two painted faces?','27','36','54','12','B','expert','spatial'),
-- expert memory
('Sequence 9 - 4 - 8 - 2 - 6 - 3 - 7. Which item was fifth?','2','6','3','8','B','expert','memory'),
('Pairs: alpha-14, beta-7, gamma-21, delta-5. What is gamma minus delta?','14','16','26','9','B','expert','memory'),
('Digits 5 - 1 - 9 - 3 - 7 - 2. Report them backwards.','5 - 1 - 9 - 3 - 7 - 2','2 - 7 - 3 - 9 - 1 - 5','2 - 3 - 7 - 9 - 1 - 5','7 - 2 - 5 - 1 - 9 - 3','B','expert','memory'),
('List: VECTOR, MARBLE, CANDLE, PRISM, LANTERN, ECHO. Which word was fifth?','PRISM','LANTERN','ECHO','CANDLE','B','expert','memory')
ON CONFLICT DO NOTHING;

-- 6) Correct difficulty label for the advanced test
CREATE OR REPLACE FUNCTION public._iq_test_config(_category text)
 RETURNS TABLE(qcount integer, credits integer, diff text, only_category text)
 LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $function$
  SELECT t.qcount, t.credits, t.diff, t.only_category FROM (VALUES
    ('beginner',     20, 10, 'beginner'::text, NULL::text),
    ('intermediate', 25, 15, 'intermediate',   NULL),
    ('advanced',     30, 20, 'advanced',       NULL),
    ('expert',       30, 25, 'expert',         NULL),
    ('logical',      15,  8, NULL,             'logical'),
    ('spatial',      15,  8, NULL,             'spatial'),
    ('verbal',       15,  8, NULL,             'verbal'),
    ('numerical',    15,  8, NULL,             'numerical'),
    ('memory',       15,  8, NULL,             'memory'),
    ('pattern',      15,  8, NULL,             'pattern')
  ) AS t(cat, qcount, credits, diff, only_category)
  WHERE t.cat = _category;
$function$;

-- 7) Strict difficulty match + avoid repeating questions the user already saw
CREATE OR REPLACE FUNCTION public.start_iq_test(_category text)
 RETURNS TABLE(session_id uuid, questions jsonb, credits_spent integer)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_cfg record;
  v_ids uuid[];
  v_seen uuid[];
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

  SELECT COALESCE(array_agg(DISTINCT qid), '{}'::uuid[]) INTO v_seen
  FROM (
    SELECT unnest(s.question_ids) AS qid
    FROM public.iq_test_sessions s
    WHERE s.user_id = v_uid
    LIMIT 4000
  ) t;

  SELECT array_agg(id) INTO v_ids FROM (
    SELECT id FROM public.iq_questions
    WHERE (v_cfg.diff IS NULL OR difficulty = v_cfg.diff)
      AND (v_cfg.only_category IS NULL OR category = v_cfg.only_category)
      AND NOT (id = ANY(v_seen))
    ORDER BY random() LIMIT v_cfg.qcount
  ) q;

  IF v_ids IS NULL OR array_length(v_ids,1) < v_cfg.qcount THEN
    SELECT COALESCE(v_ids,'{}'::uuid[]) || COALESCE(array_agg(id), '{}'::uuid[]) INTO v_ids FROM (
      SELECT id FROM public.iq_questions
      WHERE (v_cfg.diff IS NULL OR difficulty = v_cfg.diff)
        AND (v_cfg.only_category IS NULL OR category = v_cfg.only_category)
        AND NOT (id = ANY(COALESCE(v_ids,'{}'::uuid[])))
      ORDER BY random() LIMIT GREATEST(0, v_cfg.qcount - COALESCE(array_length(v_ids,1),0))
    ) q2;
  END IF;

  IF v_ids IS NULL OR array_length(v_ids,1) < 5 THEN RAISE EXCEPTION 'not_enough_questions'; END IF;

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
END $function$;