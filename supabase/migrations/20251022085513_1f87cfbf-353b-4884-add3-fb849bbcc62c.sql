-- Odstránenie starej politiky a vytvorenie novej s WITH CHECK
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.talent_submissions;

CREATE POLICY "Users can update their own submissions"
ON public.talent_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);