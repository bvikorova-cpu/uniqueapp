-- Feed Preferences
CREATE TABLE IF NOT EXISTS feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preferred_categories TEXT[] DEFAULT '{}',
  hidden_users UUID[] DEFAULT '{}',
  sort_preference TEXT DEFAULT 'smart',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feed_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feed preferences"
  ON feed_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own feed preferences"
  ON feed_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feed preferences"
  ON feed_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Reports
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  reported_post_id UUID,
  reported_comment_id UUID,
  report_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON user_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Pinned Posts
CREATE TABLE IF NOT EXISTS pinned_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  pinned_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pinned_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view all pinned posts"
  ON pinned_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can pin their own posts"
  ON pinned_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unpin their own posts"
  ON pinned_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view all follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow other users"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow other users"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feed_preferences_user ON feed_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_pinned_posts_user ON pinned_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);