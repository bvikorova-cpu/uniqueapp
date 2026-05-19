CREATE POLICY "Authenticated users can view completed courses"
ON public.completed_courses
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view course progress"
ON public.course_progress
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);