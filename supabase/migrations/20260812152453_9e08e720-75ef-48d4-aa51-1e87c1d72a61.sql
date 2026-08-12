DROP POLICY IF EXISTS "Musicians can create their own concerts" ON public.live_concert_streams;

CREATE POLICY "Verified musicians can create their own concerts"
ON public.live_concert_streams
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.musician_profiles mp
    WHERE mp.id = live_concert_streams.musician_id
      AND mp.user_id = auth.uid()
      AND mp.verified = true
      AND COALESCE(mp.suspended, false) = false
  )
);

DROP POLICY IF EXISTS "Musicians can update their own concerts" ON public.live_concert_streams;

CREATE POLICY "Verified musicians can update their own concerts"
ON public.live_concert_streams
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.musician_profiles mp
    WHERE mp.id = live_concert_streams.musician_id
      AND mp.user_id = auth.uid()
      AND mp.verified = true
      AND COALESCE(mp.suspended, false) = false
  )
);