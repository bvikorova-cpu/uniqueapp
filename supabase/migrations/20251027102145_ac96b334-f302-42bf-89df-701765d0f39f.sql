-- Fix search_path security warning for the new function
CREATE OR REPLACE FUNCTION update_collectible_evolution_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;