CREATE OR REPLACE VIEW public.live_concert_streams_public AS
 SELECT id, musician_id, title, description, scheduled_at, started_at, ended_at,
        status, viewer_count, total_revenue, created_at, updated_at, cover_image_url
   FROM public.live_concert_streams;
GRANT SELECT ON public.live_concert_streams_public TO anon, authenticated;