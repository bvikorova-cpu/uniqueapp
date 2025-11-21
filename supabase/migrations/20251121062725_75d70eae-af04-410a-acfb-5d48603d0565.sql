-- Add RLS policies for quiz tables

-- Policies for course_quizzes
CREATE POLICY "Students can view quizzes for enrolled courses"
ON public.course_quizzes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_lessons
    JOIN public.course_enrollments ON course_enrollments.course_id = course_lessons.course_id
    WHERE course_lessons.id = course_quizzes.lesson_id
    AND course_enrollments.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.course_lessons
    JOIN public.courses ON courses.id = course_lessons.course_id
    WHERE course_lessons.id = course_quizzes.lesson_id
    AND courses.creator_id = auth.uid()
  )
);

CREATE POLICY "Course creators can manage their quizzes"
ON public.course_quizzes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_lessons
    JOIN public.courses ON courses.id = course_lessons.course_id
    WHERE course_lessons.id = course_quizzes.lesson_id
    AND courses.creator_id = auth.uid()
  )
);

-- Policies for quiz_questions
CREATE POLICY "Students can view questions for enrolled courses"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_quizzes
    JOIN public.course_lessons ON course_lessons.id = course_quizzes.lesson_id
    JOIN public.course_enrollments ON course_enrollments.course_id = course_lessons.course_id
    WHERE course_quizzes.id = quiz_questions.quiz_id
    AND course_enrollments.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.course_quizzes
    JOIN public.course_lessons ON course_lessons.id = course_quizzes.lesson_id
    JOIN public.courses ON courses.id = course_lessons.course_id
    WHERE course_quizzes.id = quiz_questions.quiz_id
    AND courses.creator_id = auth.uid()
  )
);

CREATE POLICY "Course creators can manage quiz questions"
ON public.quiz_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_quizzes
    JOIN public.course_lessons ON course_lessons.id = course_quizzes.lesson_id
    JOIN public.courses ON courses.id = course_lessons.course_id
    WHERE course_quizzes.id = quiz_questions.quiz_id
    AND courses.creator_id = auth.uid()
  )
);

-- Policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
ON public.quiz_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts"
ON public.quiz_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts"
ON public.quiz_attempts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Course creators can view all attempts for their courses"
ON public.quiz_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_quizzes
    JOIN public.course_lessons ON course_lessons.id = course_quizzes.lesson_id
    JOIN public.courses ON courses.id = course_lessons.course_id
    WHERE course_quizzes.id = quiz_attempts.quiz_id
    AND courses.creator_id = auth.uid()
  )
);