
-- user_badges: replace insecure consolidated insert with owner-only insert
DROP POLICY IF EXISTS "user_badges_insert_consolidated" ON public.user_badges;
CREATE POLICY "Users can insert own badges"
ON public.user_badges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- coloring_pages: drop the insecure variant; keep "Users can create their own coloring pages"
DROP POLICY IF EXISTS "Users and service can insert coloring pages" ON public.coloring_pages;

-- anonymous_dating_matches: replace JWT-role check with no authenticated INSERT
-- (service_role bypasses RLS, so server-side inserts still work)
DROP POLICY IF EXISTS "Server-only insert" ON public.anonymous_dating_matches;

-- pinned_posts: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view all pinned posts" ON public.pinned_posts;
CREATE POLICY "Authenticated users can view pinned posts"
ON public.pinned_posts
FOR SELECT
TO authenticated
USING (true);

-- social_gifts_user_progress: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Users can view all progress" ON public.social_gifts_user_progress;
CREATE POLICY "Authenticated users can view all progress"
ON public.social_gifts_user_progress
FOR SELECT
TO authenticated
USING (true);
