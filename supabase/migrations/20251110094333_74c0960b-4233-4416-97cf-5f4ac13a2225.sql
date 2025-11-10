-- Fix search_path for update_battle_stats function
CREATE OR REPLACE FUNCTION update_battle_stats(
  winner_id UUID,
  loser_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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