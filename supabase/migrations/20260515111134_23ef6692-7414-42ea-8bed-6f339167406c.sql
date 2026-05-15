
-- Fix 3 SECURITY DEFINER views: switch to security_invoker so RLS of the calling user applies
ALTER VIEW public.coupon_loyalty_tier SET (security_invoker = true);
ALTER VIEW public.coupon_seller_analytics SET (security_invoker = true);
ALTER VIEW public.coupon_seller_stats SET (security_invoker = true);

-- Fix stream_key exposure on live_streams: replace public SELECT policy with a safe view
DROP POLICY IF EXISTS "Public can view active streams (safe cols only)" ON public.live_streams;

CREATE OR REPLACE VIEW public.live_streams_public
WITH (security_invoker = true) AS
SELECT id, influencer_id, title, description, thumbnail_url, is_live,
       viewer_count, started_at, ended_at, created_at, updated_at, stream_url
FROM public.live_streams
WHERE is_live = true;

GRANT SELECT ON public.live_streams_public TO anon, authenticated;

-- Fix stream_key exposure on live_concert_streams: replace public SELECT policy with a safe view
DROP POLICY IF EXISTS "Concert streams are viewable by everyone" ON public.live_concert_streams;

CREATE POLICY "Owners can view their full concert stream"
ON public.live_concert_streams
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.musician_profiles
  WHERE musician_profiles.id = live_concert_streams.musician_id
    AND musician_profiles.user_id = auth.uid()
));

CREATE OR REPLACE VIEW public.live_concert_streams_public
WITH (security_invoker = true) AS
SELECT id, musician_id, title, description, scheduled_at, started_at, ended_at,
       status, viewer_count, total_revenue, created_at, updated_at
FROM public.live_concert_streams;

GRANT SELECT ON public.live_concert_streams_public TO anon, authenticated;
