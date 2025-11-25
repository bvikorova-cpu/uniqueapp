-- Performance optimization: Add indexes for most frequently queried columns
-- Only for tables that exist in the database

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);

-- Reposts table indexes
CREATE INDEX IF NOT EXISTS idx_reposts_created_at ON public.reposts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON public.reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_original_post_id ON public.reposts(original_post_id);

-- Media table indexes (for posts joins)
CREATE INDEX IF NOT EXISTS idx_media_post_id ON public.media(post_id);

-- User follows indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_composite ON public.user_follows(follower_id, following_id);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);

-- Activity feed indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_created ON public.activity_feed(user_id, created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- Brain duel indexes for online players query
CREATE INDEX IF NOT EXISTS idx_brain_duel_matches_status ON public.brain_duel_matches(status);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);

-- ANALYZE tables to update statistics for query planner
ANALYZE public.posts;
ANALYZE public.reposts;
ANALYZE public.media;
ANALYZE public.profiles;
ANALYZE public.user_follows;
ANALYZE public.notifications;
ANALYZE public.activity_feed;
ANALYZE public.bookmarks;