-- P1.1: Tighten video_views RLS — close anonymous insert hole.
-- The previous policy "Anyone can record a view" allowed any anon/authenticated
-- caller to insert arbitrary rows, enabling view-count abuse and storage spam.

DROP POLICY IF EXISTS "Anyone can record a view" ON public.video_views;

-- Authenticated users may only insert a view for THEMSELVES.
CREATE POLICY "Authenticated users can record their own view"
ON public.video_views
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Service role bypasses RLS automatically, so anonymous tracking can still be
-- performed server-side via an edge function with proper rate-limiting once
-- such a feature is built.
