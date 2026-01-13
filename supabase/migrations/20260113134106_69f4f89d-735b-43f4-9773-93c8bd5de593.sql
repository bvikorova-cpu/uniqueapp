-- Create table for Shadow Arena battle placements (tracking top 3 winners)
CREATE TABLE IF NOT EXISTS shadow_battle_placements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES shadow_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  placement INTEGER NOT NULL CHECK (placement >= 1 AND placement <= 3),
  prize_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(battle_id, user_id),
  UNIQUE(battle_id, placement)
);

-- Enable RLS
ALTER TABLE shadow_battle_placements ENABLE ROW LEVEL SECURITY;

-- Policies for shadow_battle_placements
CREATE POLICY "Users can view all placements" ON shadow_battle_placements FOR SELECT USING (true);
CREATE POLICY "System can insert placements" ON shadow_battle_placements FOR INSERT WITH CHECK (true);

-- Create Shadow Arena Talent Badge in badges table
INSERT INTO badges (name, description, icon, requirement_type, requirement_value, points_reward)
VALUES (
  'Shadow Arena Talent',
  'Top 3 winner in a Shadow Arena Monthly Battle - Verified Creative & Performance Achievement',
  '🏆',
  'shadow_arena_winner',
  1,
  100
) ON CONFLICT DO NOTHING;

-- Create table to track which badges are from Shadow Arena (for Teen Career integration)
CREATE TABLE IF NOT EXISTS shadow_arena_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  battle_id UUID REFERENCES shadow_battles(id) ON DELETE SET NULL,
  placement INTEGER NOT NULL CHECK (placement >= 1 AND placement <= 3),
  badge_type TEXT NOT NULL DEFAULT 'shadow_arena_talent',
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notified_teen_career BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE shadow_arena_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own achievements" ON shadow_arena_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view all achievements for public display" ON shadow_arena_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON shadow_arena_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update achievements" ON shadow_arena_achievements FOR UPDATE USING (true);