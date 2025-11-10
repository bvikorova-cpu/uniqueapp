-- Add battle statistics columns to characters table
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS battle_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS battle_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS battle_rating INTEGER DEFAULT 1000;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_characters_battle_rating ON characters(battle_rating DESC);

-- Create function to update battle statistics
CREATE OR REPLACE FUNCTION update_battle_stats(
  winner_id UUID,
  loser_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update winner
  UPDATE characters
  SET 
    battle_wins = battle_wins + 1,
    battle_rating = battle_rating + 25
  WHERE id = winner_id;
  
  -- Update loser
  UPDATE characters
  SET 
    battle_losses = battle_losses + 1,
    battle_rating = GREATEST(battle_rating - 15, 0)
  WHERE id = loser_id;
END;
$$;