-- Add leveling system columns to characters table
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS experience_to_next_level INTEGER DEFAULT 100;

-- Create function to calculate experience needed for next level
CREATE OR REPLACE FUNCTION calculate_exp_for_level(current_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Experience required increases by 50 per level (100, 150, 200, 250, etc.)
  RETURN 100 + ((current_level - 1) * 50);
END;
$$;

-- Update the battle stats function to award experience
CREATE OR REPLACE FUNCTION update_battle_stats(
  winner_id UUID,
  loser_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_winner_level INTEGER;
  v_winner_exp INTEGER;
  v_winner_exp_needed INTEGER;
  v_loser_level INTEGER;
  v_loser_exp INTEGER;
  v_loser_exp_needed INTEGER;
  v_winner_exp_gain INTEGER := 50; -- Winner gets 50 XP
  v_loser_exp_gain INTEGER := 10;  -- Loser gets 10 XP for participation
BEGIN
  -- Get winner's current stats
  SELECT level, experience, experience_to_next_level
  INTO v_winner_level, v_winner_exp, v_winner_exp_needed
  FROM characters WHERE id = winner_id;
  
  -- Get loser's current stats
  SELECT level, experience, experience_to_next_level
  INTO v_loser_level, v_loser_exp, v_loser_exp_needed
  FROM characters WHERE id = loser_id;
  
  -- Update winner
  v_winner_exp := v_winner_exp + v_winner_exp_gain;
  
  -- Check for level up (winner)
  WHILE v_winner_exp >= v_winner_exp_needed LOOP
    v_winner_exp := v_winner_exp - v_winner_exp_needed;
    v_winner_level := v_winner_level + 1;
    v_winner_exp_needed := calculate_exp_for_level(v_winner_level);
  END LOOP;
  
  UPDATE characters
  SET 
    battle_wins = battle_wins + 1,
    battle_rating = battle_rating + 25,
    level = v_winner_level,
    experience = v_winner_exp,
    experience_to_next_level = v_winner_exp_needed,
    -- Stat boost on level up
    hp = hp + (v_winner_level - (SELECT level FROM characters WHERE id = winner_id)) * 5,
    attack = attack + (v_winner_level - (SELECT level FROM characters WHERE id = winner_id)) * 2,
    defense = defense + (v_winner_level - (SELECT level FROM characters WHERE id = winner_id)) * 1
  WHERE id = winner_id;
  
  -- Update loser (gets participation XP)
  v_loser_exp := v_loser_exp + v_loser_exp_gain;
  
  -- Check for level up (loser)
  WHILE v_loser_exp >= v_loser_exp_needed LOOP
    v_loser_exp := v_loser_exp - v_loser_exp_needed;
    v_loser_level := v_loser_level + 1;
    v_loser_exp_needed := calculate_exp_for_level(v_loser_level);
  END LOOP;
  
  UPDATE characters
  SET 
    battle_losses = battle_losses + 1,
    battle_rating = GREATEST(battle_rating - 15, 0),
    level = v_loser_level,
    experience = v_loser_exp,
    experience_to_next_level = v_loser_exp_needed,
    -- Stat boost on level up
    hp = hp + (v_loser_level - (SELECT level FROM characters WHERE id = loser_id)) * 5,
    attack = attack + (v_loser_level - (SELECT level FROM characters WHERE id = loser_id)) * 2,
    defense = defense + (v_loser_level - (SELECT level FROM characters WHERE id = loser_id)) * 1
  WHERE id = loser_id;
END;
$$;