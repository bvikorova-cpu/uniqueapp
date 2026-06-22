DROP POLICY IF EXISTS "insert streams" ON public.music_streams;

CREATE POLICY "insert streams"
ON public.music_streams
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (listener_id IS NULL OR listener_id = auth.uid())
  AND duration_ms > 0
  AND duration_ms <= 3600000
  AND royalty_id IS NULL
);