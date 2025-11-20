-- Add RLS policies for horse_currency
ALTER TABLE horse_currency ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own currency
CREATE POLICY "Users can view own currency"
ON horse_currency FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own currency (for initial setup)
CREATE POLICY "Users can insert own currency"
ON horse_currency FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own currency
CREATE POLICY "Users can update own currency"
ON horse_currency FOR UPDATE
USING (auth.uid() = user_id);

-- Add stat limits constraint to horses table
ALTER TABLE horses 
ADD CONSTRAINT check_speed_limit CHECK (speed_stat >= 0 AND speed_stat <= 100),
ADD CONSTRAINT check_stamina_limit CHECK (stamina_stat >= 0 AND stamina_stat <= 100),
ADD CONSTRAINT check_acceleration_limit CHECK (acceleration_stat >= 0 AND acceleration_stat <= 100),
ADD CONSTRAINT check_temperament_limit CHECK (temperament_stat >= 0 AND temperament_stat <= 100);

-- Create function to give starter balance
CREATE OR REPLACE FUNCTION public.give_starter_balance(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user already has currency record
  IF NOT EXISTS (SELECT 1 FROM horse_currency WHERE user_id = p_user_id) THEN
    -- Give 100 coins and 10 gems as starter balance
    INSERT INTO horse_currency (user_id, coins, gems)
    VALUES (p_user_id, 100, 10);
  END IF;
END;
$$;