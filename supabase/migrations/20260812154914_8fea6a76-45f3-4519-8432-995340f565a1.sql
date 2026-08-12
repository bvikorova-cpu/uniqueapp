ALTER VIEW public.live_concert_streams_public SET (security_invoker = false);
GRANT SELECT ON public.live_concert_streams_public TO anon, authenticated;