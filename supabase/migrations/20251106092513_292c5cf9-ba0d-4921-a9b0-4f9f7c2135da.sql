-- Add profile fields for skill swap
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_offered TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_wanted TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_exchanges INTEGER DEFAULT 0;

-- Create skill swap reviews table
CREATE TABLE IF NOT EXISTS skill_swap_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES skill_swap_conversations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, conversation_id)
);

-- Add exchange completion status to conversations
ALTER TABLE skill_swap_conversations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));
ALTER TABLE skill_swap_conversations ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE skill_swap_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews"
  ON skill_swap_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their exchanges"
  ON skill_swap_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM skill_swap_conversations
      WHERE id = conversation_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON skill_swap_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON skill_swap_reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Function to update user rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET 
      rating_average = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = OLD.reviewed_user_id
      ), 0.00),
      total_reviews = COALESCE((
        SELECT COUNT(*)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = OLD.reviewed_user_id
      ), 0)
    WHERE id = OLD.reviewed_user_id;
    RETURN OLD;
  ELSE
    UPDATE profiles
    SET 
      rating_average = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id
      ), 0.00),
      total_reviews = COALESCE((
        SELECT COUNT(*)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id
      ), 0)
    WHERE id = NEW.reviewed_user_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating
CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON skill_swap_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Function to update completed exchanges count
CREATE OR REPLACE FUNCTION update_completed_exchanges()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
    
    -- Update both users' completed exchanges count
    UPDATE profiles
    SET completed_exchanges = completed_exchanges + 1
    WHERE id IN (NEW.user1_id, NEW.user2_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update completed exchanges
CREATE TRIGGER update_exchanges_on_completion
  BEFORE UPDATE ON skill_swap_conversations
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_completed_exchanges();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON skill_swap_reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON skill_swap_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON skill_swap_conversations(status);