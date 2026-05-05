
-- Grant execute on helper to fix 403 across the project
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated, anon;

-- Replace destinations policies with clean auth.uid() based ones
DROP POLICY IF EXISTS "Users can delete their own destinations" ON public.destinations;
DROP POLICY IF EXISTS "Authenticated users can delete own destinations" ON public.destinations;
DROP POLICY IF EXISTS "Authenticated users can create destinations" ON public.destinations;
DROP POLICY IF EXISTS "Authenticated users can view own destinations" ON public.destinations;
DROP POLICY IF EXISTS "Authenticated users can update own destinations" ON public.destinations;
DROP POLICY IF EXISTS "Users can update their own destinations" ON public.destinations;

CREATE POLICY "Owners delete destinations" ON public.destinations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Auth create destinations" ON public.destinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update destinations" ON public.destinations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow public viewing of photos/reviews for active destinations (community feed)
DROP POLICY IF EXISTS "Users can view photos of their destinations" ON public.destination_photos;
CREATE POLICY "Public view photos of active destinations" ON public.destination_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = destination_photos.destination_id AND d.is_active = true)
);

DROP POLICY IF EXISTS "Users can create photos for their destinations" ON public.destination_photos;
CREATE POLICY "Owners insert destination photos" ON public.destination_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update photos of their destinations" ON public.destination_photos;
CREATE POLICY "Owners update destination photos" ON public.destination_photos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete photos of their destinations" ON public.destination_photos;
CREATE POLICY "Owners delete destination photos" ON public.destination_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid())
);
