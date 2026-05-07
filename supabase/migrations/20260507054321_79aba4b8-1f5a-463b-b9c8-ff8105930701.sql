
-- 1. live_streams: stop exposing stream_key publicly
DROP POLICY IF EXISTS "Anyone can view active streams" ON public.live_streams;

-- Owner can read their own full row (including stream_key)
CREATE POLICY "Owners can view their full stream row"
ON public.live_streams
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.influencer_profiles ip
  WHERE ip.id = live_streams.influencer_id AND ip.user_id = auth.uid()
));

-- Public/safe view that omits the stream_key
CREATE OR REPLACE VIEW public.public_live_streams
WITH (security_invoker = true) AS
SELECT id, influencer_id, title, description, thumbnail_url,
       is_live, viewer_count, started_at, ended_at,
       created_at, updated_at, stream_url
FROM public.live_streams
WHERE is_live = true;

GRANT SELECT ON public.public_live_streams TO anon, authenticated;

-- The view runs as invoker; allow public select on safe columns of base table
-- via a column-restricted policy for non-owners reading active streams.
CREATE POLICY "Public can view active streams (safe cols only)"
ON public.live_streams
FOR SELECT
TO anon, authenticated
USING (is_live = true);

-- Revoke direct column access to stream_key for non-owners.
REVOKE SELECT (stream_key) ON public.live_streams FROM anon, authenticated;
GRANT SELECT (id, influencer_id, title, description, thumbnail_url,
              is_live, viewer_count, started_at, ended_at,
              created_at, updated_at, stream_url)
ON public.live_streams TO anon, authenticated;

-- 2. couples_subscriptions: hide partner_b_email from clients (only edge functions / service_role read it)
REVOKE SELECT (partner_b_email) ON public.couples_subscriptions FROM anon, authenticated;

-- 3. sca_pending_actions: drop email-based matching from RLS
DROP POLICY IF EXISTS "users view own sca actions" ON public.sca_pending_actions;
CREATE POLICY "users view own sca actions"
ON public.sca_pending_actions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
