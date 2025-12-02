-- Fix search_path security warning by replacing function
CREATE OR REPLACE FUNCTION update_lie_detector_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;