DROP POLICY IF EXISTS "Subscribed users can create swipes" ON public.dating_swipes;

CREATE POLICY "Users can create own swipes"
ON public.dating_swipes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = swiper_id);

DROP POLICY IF EXISTS "Users can update own swipes" ON public.dating_swipes;
CREATE POLICY "Users can update own swipes"
ON public.dating_swipes FOR UPDATE TO authenticated
USING (auth.uid() = swiper_id)
WITH CHECK (auth.uid() = swiper_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_swipes TO authenticated;
GRANT ALL ON public.dating_swipes TO service_role;