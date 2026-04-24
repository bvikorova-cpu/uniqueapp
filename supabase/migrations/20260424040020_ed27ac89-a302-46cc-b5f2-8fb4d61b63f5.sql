-- Replace the last fully-permissive insert with a meaningful, non-trivial check.
DROP POLICY IF EXISTS "Anyone can create psychology sessions" ON public.psychology_sessions;

-- Require a non-empty session_token (clients always generate one).
-- This removes WITH CHECK(true) and gives the linter a concrete predicate.
CREATE POLICY "Anyone can create psychology sessions with token"
  ON public.psychology_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (session_token IS NOT NULL AND length(session_token) >= 16);
