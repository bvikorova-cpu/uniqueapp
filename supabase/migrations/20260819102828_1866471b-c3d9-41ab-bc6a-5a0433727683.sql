GRANT SELECT, INSERT, UPDATE ON public.course_certificates TO authenticated;
GRANT ALL ON public.course_certificates TO service_role;

DROP POLICY IF EXISTS "Users can create their own certificates" ON public.course_certificates;
CREATE POLICY "Users can create their own certificates"
ON public.course_certificates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own certificates" ON public.course_certificates;
CREATE POLICY "Users can update their own certificates"
ON public.course_certificates FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);