-- Fix search_path for the trigger function using CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_handwriting_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public, pg_temp;