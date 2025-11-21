-- Enable RLS on Mystery Box tables
ALTER TABLE mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_box_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_box_items ENABLE ROW LEVEL SECURITY;

-- Mystery Boxes: Public read, users can purchase
CREATE POLICY "Anyone can view mystery boxes"
  ON mystery_boxes FOR SELECT
  USING (true);

-- User Mystery Boxes: Users can only see their own boxes
CREATE POLICY "Users can view their own mystery boxes"
  ON user_mystery_boxes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mystery boxes"
  ON user_mystery_boxes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mystery boxes"
  ON user_mystery_boxes FOR UPDATE
  USING (auth.uid() = user_id);

-- Mystery Box Rewards: Users can only see their own active rewards
CREATE POLICY "Users can view their own rewards"
  ON mystery_box_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
  ON mystery_box_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON mystery_box_rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- Mystery Box Items: Public read (reference data)
CREATE POLICY "Anyone can view mystery box items"
  ON mystery_box_items FOR SELECT
  USING (true);