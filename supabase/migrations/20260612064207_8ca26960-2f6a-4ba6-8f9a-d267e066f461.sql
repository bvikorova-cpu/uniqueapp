-- Consolidate user_follows into follows. user_follows becomes an updatable view.
-- Both tables are empty; safe to drop user_follows table and replace with view.

-- Drop the duplicate table (was empty)
DROP TABLE IF EXISTS public.user_follows CASCADE;

-- Recreate as a view over follows for backward compatibility with existing code
CREATE VIEW public.user_follows AS
  SELECT id, follower_id, following_id, created_at FROM public.follows;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_follows TO authenticated;
GRANT SELECT ON public.user_follows TO anon;
GRANT ALL ON public.user_follows TO service_role;

-- Simple single-table views on a single table are auto-updatable in Postgres,
-- so INSERT/DELETE on user_follows will transparently hit follows.
-- RLS on follows governs access.