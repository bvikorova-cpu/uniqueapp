DROP POLICY IF EXISTS "Enrolled students can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Enrolled students can view quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.course_quizzes cq
    JOIN public.course_lessons cl ON cl.id = cq.lesson_id
    JOIN public.course_enrollments ce ON ce.course_id = cl.course_id
    WHERE cq.id = quiz_questions.quiz_id
      AND ce.user_id = auth.uid()
  )
);