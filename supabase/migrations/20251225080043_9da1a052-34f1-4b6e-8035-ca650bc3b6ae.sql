-- =====================================================
-- PERFORMANCE INDEXES FOR SCALING (verified columns)
-- =====================================================

-- Posts table
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
ON public.posts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON public.posts(created_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON public.messages(conversation_id, created_at DESC);

-- Bazaar items
CREATE INDEX IF NOT EXISTS idx_bazaar_items_category_active 
ON public.bazaar_items(category, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_bazaar_items_user_active 
ON public.bazaar_items(user_id, is_active);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON public.notifications(user_id, is_read, created_at DESC);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower 
ON public.follows(follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following 
ON public.follows(following_id);

-- AI Generated Content
CREATE INDEX IF NOT EXISTS idx_ai_content_user_type 
ON public.ai_generated_content(user_id, content_type, created_at DESC);

-- Rate limits cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup 
ON public.rate_limits(window_start);

-- Post likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post 
ON public.post_likes(post_id);

-- Post comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created 
ON public.post_comments(post_id, created_at DESC);

-- Profiles username search
CREATE INDEX IF NOT EXISTS idx_profiles_full_name 
ON public.profiles(full_name);