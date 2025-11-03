-- Create tables for paint by numbers feature

-- Main table for paint by numbers images
CREATE TABLE paint_by_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'fairy-tales', 'animals', 'nature', 'vehicles', etc.
  difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  price_coins INTEGER NOT NULL DEFAULT 50,
  thumbnail_url TEXT,
  image_data JSONB NOT NULL, -- Contains sections with coordinates, color codes, and numbers
  total_sections INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User progress for paint by numbers
CREATE TABLE user_paint_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  paint_id UUID NOT NULL REFERENCES paint_by_numbers(id) ON DELETE CASCADE,
  completed_sections INTEGER[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, paint_id)
);

-- User paint by numbers purchases
CREATE TABLE user_paint_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  paint_id UUID NOT NULL REFERENCES paint_by_numbers(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, paint_id)
);

-- Enable RLS
ALTER TABLE paint_by_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_paint_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_paint_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paint_by_numbers (public read)
CREATE POLICY "Anyone can view paint by numbers"
  ON paint_by_numbers FOR SELECT
  USING (true);

-- RLS Policies for user_paint_progress
CREATE POLICY "Users can view their own progress"
  ON user_paint_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_paint_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_paint_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_paint_purchases
CREATE POLICY "Users can view their own purchases"
  ON user_paint_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON user_paint_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_paint_category ON paint_by_numbers(category);
CREATE INDEX idx_paint_difficulty ON paint_by_numbers(difficulty);
CREATE INDEX idx_user_paint_progress_user ON user_paint_progress(user_id);
CREATE INDEX idx_user_paint_purchases_user ON user_paint_purchases(user_id);

-- Insert sample paint by numbers images (we'll create 20 to start, can add more later)
INSERT INTO paint_by_numbers (title, category, difficulty, price_coins, total_sections, image_data) VALUES
('Cute Unicorn', 'fairy-tales', 'easy', 30, 8, '{"sections": [{"id": 1, "color": "#FFFFFF", "number": 1}, {"id": 2, "color": "#FFB6C1", "number": 2}], "colors": [{"number": 1, "color": "#FFFFFF", "name": "White"}, {"number": 2, "color": "#FFB6C1", "name": "Pink"}]}'),
('Magical Castle', 'fairy-tales', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Princess Aurora', 'fairy-tales', 'hard', 80, 20, '{"sections": [], "colors": []}'),
('Friendly Lion', 'animals', 'easy', 30, 8, '{"sections": [], "colors": []}'),
('Colorful Butterfly', 'animals', 'easy', 30, 8, '{"sections": [], "colors": []}'),
('Cute Elephant', 'animals', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Forest Bear', 'animals', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Ocean Dolphin', 'animals', 'hard', 80, 20, '{"sections": [], "colors": []}'),
('Rainbow Parrot', 'animals', 'hard', 80, 20, '{"sections": [], "colors": []}'),
('Sunset Beach', 'nature', 'easy', 30, 8, '{"sections": [], "colors": []}'),
('Mountain Landscape', 'nature', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Flower Garden', 'nature', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Starry Night', 'nature', 'hard', 80, 20, '{"sections": [], "colors": []}'),
('Race Car', 'vehicles', 'easy', 30, 8, '{"sections": [], "colors": []}'),
('Fire Truck', 'vehicles', 'easy', 30, 8, '{"sections": [], "colors": []}'),
('Airplane', 'vehicles', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Pirate Ship', 'vehicles', 'medium', 50, 12, '{"sections": [], "colors": []}'),
('Space Rocket', 'vehicles', 'hard', 80, 20, '{"sections": [], "colors": []}'),
('Mermaid Princess', 'fairy-tales', 'hard', 80, 20, '{"sections": [], "colors": []}'),
('Happy Dinosaur', 'animals', 'medium', 50, 12, '{"sections": [], "colors": []}');