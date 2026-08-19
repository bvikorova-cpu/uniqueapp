CREATE OR REPLACE FUNCTION public.get_quiz_questions_public(_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question text,
  options jsonb,
  order_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.quiz_id, q.question, q.options, q.order_index
  FROM public.quiz_questions q
  WHERE q.quiz_id = _quiz_id
    AND (
      EXISTS (
        SELECT 1
        FROM public.course_quizzes cq
        JOIN public.course_lessons cl ON cl.id = cq.lesson_id
        JOIN public.course_enrollments ce ON ce.course_id = cl.course_id
        WHERE cq.id = q.quiz_id
          AND ce.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.course_quizzes cq
        JOIN public.course_lessons cl ON cl.id = cq.lesson_id
        JOIN public.courses c ON c.id = cl.course_id
        WHERE cq.id = q.quiz_id
          AND c.creator_id = auth.uid()
      )
    )
  ORDER BY q.order_index;
$$;

REVOKE ALL ON FUNCTION public.get_quiz_questions_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_public(uuid) TO authenticated;