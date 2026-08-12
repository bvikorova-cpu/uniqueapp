DROP POLICY IF EXISTS "Subscribers can view all stories" ON public.shadow_stories;

CREATE POLICY "Authenticated users can view stories"
ON public.shadow_stories FOR SELECT
TO authenticated
USING (true);

GRANT SELECT, INSERT, UPDATE ON public.shadow_stories TO authenticated;
GRANT ALL ON public.shadow_stories TO service_role;