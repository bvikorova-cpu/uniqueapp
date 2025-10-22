-- Odstránenie existujúcej UPDATE politiky
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.talent_submissions;

-- Vytvorenie novej politiky s explicitným WITH CHECK
-- Toto umožní používateľom meniť is_active na ich vlastných príspevkoch
CREATE POLICY "Users can update their own submissions"
ON public.talent_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);