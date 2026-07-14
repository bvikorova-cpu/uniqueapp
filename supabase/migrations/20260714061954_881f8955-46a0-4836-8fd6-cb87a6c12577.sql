
DROP VIEW IF EXISTS public.doctors_public CASCADE;
DROP VIEW IF EXISTS public.dating_profiles_public CASCADE;
DROP VIEW IF EXISTS public.escape_room_puzzles_public CASCADE;
DROP VIEW IF EXISTS public.quiz_questions_public CASCADE;

-- 1) HEALTHCARE_PROFILES
DROP POLICY IF EXISTS "Public can view accepting doctors" ON public.healthcare_profiles;
CREATE VIEW public.doctors_public WITH (security_invoker = true) AS
SELECT id, user_id, provider_name, provider_logo_url, specialty, bio, languages,
  consultation_price_cents, consultation_duration_min, is_accepting_bookings,
  timezone, verification_status, created_at, updated_at
FROM public.healthcare_profiles WHERE is_accepting_bookings = true;
GRANT SELECT ON public.doctors_public TO anon, authenticated;

-- 2) DATING_PROFILES
DROP POLICY IF EXISTS "Authenticated can browse active profiles" ON public.dating_profiles;
CREATE VIEW public.dating_profiles_public WITH (security_invoker = true) AS
SELECT id, user_id, display_name, bio, age, gender, looking_for, location,
  profile_photo_url, additional_photos, interests, is_active,
  created_at, updated_at, prompts, voice_intro_url, voice_intro_duration,
  spotify_url, instagram_url, photo_verified,
  compatibility_quiz, opening_move, passport_location, video_prompts
FROM public.dating_profiles
WHERE is_active = true AND COALESCE(incognito,false)=false AND COALESCE(is_shadow_banned,false)=false;
GRANT SELECT ON public.dating_profiles_public TO authenticated;
CREATE POLICY "Authenticated browse via public view" ON public.dating_profiles
FOR SELECT TO authenticated
USING (is_active=true AND COALESCE(incognito,false)=false AND COALESCE(is_shadow_banned,false)=false);

-- 3) ESCAPE_ROOM_PUZZLES
DROP POLICY IF EXISTS "Anyone can view puzzles for published rooms" ON public.escape_room_puzzles;
CREATE VIEW public.escape_room_puzzles_public WITH (security_invoker = true) AS
SELECT p.id, p.room_id, p.puzzle_order, p.puzzle_type, p.title, p.description, p.hint_cost, p.created_at
FROM public.escape_room_puzzles p
JOIN public.escape_rooms r ON r.id = p.room_id
WHERE r.is_published = true;
GRANT SELECT ON public.escape_room_puzzles_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_escape_room_solution(_puzzle_id uuid, _submitted_answer text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.escape_room_puzzles p
    JOIN public.escape_rooms r ON r.id = p.room_id
    WHERE p.id = _puzzle_id AND r.is_published = true
      AND lower(trim(p.solution::text)) = lower(trim(_submitted_answer))
  );
$$;
REVOKE ALL ON FUNCTION public.check_escape_room_solution(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.check_escape_room_solution(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_escape_room_hint(_puzzle_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.hint_text FROM public.escape_room_puzzles p
  JOIN public.escape_rooms r ON r.id = p.room_id
  WHERE p.id = _puzzle_id AND r.is_published = true;
$$;
REVOKE ALL ON FUNCTION public.get_escape_room_hint(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_escape_room_hint(uuid) TO authenticated;

-- 4) QUIZ_QUESTIONS
DROP POLICY IF EXISTS "Students can view questions for enrolled courses" ON public.quiz_questions;
CREATE POLICY "Course creators view full quiz questions" ON public.quiz_questions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM course_quizzes
  JOIN course_lessons ON course_lessons.id = course_quizzes.lesson_id
  JOIN courses ON courses.id = course_lessons.course_id
  WHERE course_quizzes.id = quiz_questions.quiz_id AND courses.creator_id = auth.uid()
));

CREATE VIEW public.quiz_questions_public WITH (security_invoker = true) AS
SELECT q.id, q.quiz_id, q.question, q.options, q.order_index
FROM public.quiz_questions q
WHERE EXISTS (
  SELECT 1 FROM course_quizzes
  JOIN course_lessons ON course_lessons.id = course_quizzes.lesson_id
  JOIN course_enrollments ON course_enrollments.course_id = course_lessons.course_id
  WHERE course_quizzes.id = q.quiz_id AND course_enrollments.user_id = auth.uid()
);
GRANT SELECT ON public.quiz_questions_public TO authenticated;

CREATE OR REPLACE FUNCTION public.grade_quiz_answer(_question_id uuid, _submitted_answer text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _correct text; _explanation text; _is_correct boolean; _enrolled boolean;
BEGIN
  SELECT correct_answer::text, explanation INTO _correct, _explanation
  FROM public.quiz_questions WHERE id = _question_id;
  IF _correct IS NULL THEN RETURN jsonb_build_object('error','question_not_found'); END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_questions q
    JOIN course_quizzes cq ON cq.id = q.quiz_id
    JOIN course_lessons cl ON cl.id = cq.lesson_id
    JOIN course_enrollments ce ON ce.course_id = cl.course_id
    WHERE q.id = _question_id AND ce.user_id = auth.uid()
  ) INTO _enrolled;
  IF NOT _enrolled THEN RETURN jsonb_build_object('error','not_enrolled'); END IF;
  _is_correct := lower(trim(_correct)) = lower(trim(_submitted_answer));
  RETURN jsonb_build_object('is_correct', _is_correct, 'explanation', _explanation);
END;
$$;
REVOKE ALL ON FUNCTION public.grade_quiz_answer(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.grade_quiz_answer(uuid, text) TO authenticated;
