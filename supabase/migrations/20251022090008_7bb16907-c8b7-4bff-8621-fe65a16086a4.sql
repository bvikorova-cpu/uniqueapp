-- Odstránenie starej UPDATE politiky
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.talent_submissions;

-- Vytvorenie novej politiky bez obmedzení na WITH CHECK
-- Používateľ môže upraviť iba svoje vlastné príspevky
CREATE POLICY "Users can update their own submissions"
ON public.talent_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);