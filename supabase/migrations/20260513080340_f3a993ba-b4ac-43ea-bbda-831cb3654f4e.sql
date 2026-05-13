-- Restrict clone_battles INSERT to authenticated owner only (was: any role with WITH CHECK true)
DROP POLICY IF EXISTS "Service can insert clone battles" ON public.clone_battles;

CREATE POLICY "Users can insert own clone battles"
ON public.clone_battles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert clone battles"
ON public.clone_battles
FOR INSERT
TO service_role
WITH CHECK (true);