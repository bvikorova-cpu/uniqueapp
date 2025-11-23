-- Add missing columns to posts table for enhanced features
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS feeling TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private'));

-- Add index for privacy queries
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON posts(privacy);

-- Create table for tagged users in posts
CREATE TABLE IF NOT EXISTS post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, tagged_user_id)
);

-- Add index for faster tag queries
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_user_id ON post_tags(tagged_user_id);

-- Enable RLS on post_tags
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_tags
CREATE POLICY "Users can view tags on posts they can see"
  ON post_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_tags.post_id
    )
  );

CREATE POLICY "Post creators can add tags"
  ON post_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_tags.post_id 
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Post creators can remove tags"
  ON post_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_tags.post_id 
      AND posts.user_id = auth.uid()
    )
  );