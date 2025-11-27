-- Add parent_comment_id for nested replies
ALTER TABLE post_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;

-- Create comment_reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for comment_reactions
CREATE POLICY "Anyone can view comment reactions" 
ON comment_reactions FOR SELECT USING (true);

CREATE POLICY "Users can add their own reactions" 
ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
ON comment_reactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_comment_id);