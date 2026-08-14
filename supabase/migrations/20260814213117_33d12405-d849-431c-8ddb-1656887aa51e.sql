CREATE POLICY "Active live streams are publicly visible"
ON public.live_streams
FOR SELECT
TO anon, authenticated
USING (is_live = true);