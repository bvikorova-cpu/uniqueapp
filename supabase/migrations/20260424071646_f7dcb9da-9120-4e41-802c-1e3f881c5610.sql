
-- Lock down psychology tables: remove public SELECT, keep counts via aggregate-friendly policy off.
-- All reads must now go through the psychology-session edge function (service role).

-- Drop the public SELECT policies
DROP POLICY IF EXISTS "Anyone can read psychology messages" ON public.psychology_messages;
DROP POLICY IF EXISTS "Sessions readable via token only" ON public.psychology_sessions;

-- Note: we also intentionally drop public INSERT for messages/sessions to prevent
-- bypassing the edge function gateway. The edge function uses service role and is
-- not affected by RLS.
DROP POLICY IF EXISTS "Anyone can insert psychology messages for existing session" ON public.psychology_messages;
DROP POLICY IF EXISTS "Anyone can create psychology sessions with token" ON public.psychology_sessions;

-- Keep RLS enabled. With no policies, anon/authenticated get no direct access.
ALTER TABLE public.psychology_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_sessions ENABLE ROW LEVEL SECURITY;

-- For the homepage live stats counter (public count of sessions/messages),
-- expose only counts via SECURITY DEFINER functions so we don't need to expose rows.
CREATE OR REPLACE FUNCTION public.get_psychology_stats()
RETURNS TABLE(sessions_count bigint, messages_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.psychology_sessions),
    (SELECT count(*) FROM public.psychology_messages);
$$;

GRANT EXECUTE ON FUNCTION public.get_psychology_stats() TO anon, authenticated;
