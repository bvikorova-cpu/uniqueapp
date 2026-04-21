-- ============================================================
-- 10) trending_topics: lock down ALL-true policy
-- ============================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='trending_topics'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.trending_topics', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Anyone can view trending topics"
ON public.trending_topics FOR SELECT
USING (true);

-- No INSERT/UPDATE/DELETE policies => only service role can write

-- ============================================================
-- 11) psychology_sessions / psychology_messages: lock down to service role
--     (clients must go through edge function `psychology-session`)
-- ============================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('psychology_sessions','psychology_messages')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      pol.policyname,
      (SELECT tablename FROM pg_policies WHERE policyname = pol.policyname AND schemaname='public' LIMIT 1));
  END LOOP;
END $$;

-- Belt-and-suspenders cleanup: known policy names
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.psychology_sessions;
DROP POLICY IF EXISTS "Anyone can view their own session" ON public.psychology_sessions;
DROP POLICY IF EXISTS "Anyone can update their own session" ON public.psychology_sessions;
DROP POLICY IF EXISTS "Authenticated users can update sessions" ON public.psychology_sessions;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.psychology_messages;
DROP POLICY IF EXISTS "Anyone can view messages from their session" ON public.psychology_messages;

-- RLS stays enabled, no policies => no client access. Service role bypasses RLS.
ALTER TABLE public.psychology_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_messages ENABLE ROW LEVEL SECURITY;
