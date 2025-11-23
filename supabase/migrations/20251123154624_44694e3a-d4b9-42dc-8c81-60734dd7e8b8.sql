-- Fix security issue with get_next_20_cet function
CREATE OR REPLACE FUNCTION get_next_20_cet(is_weekly BOOLEAN DEFAULT FALSE) 
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  cet_time TIMESTAMP WITH TIME ZONE;
  target_time TIMESTAMP WITH TIME ZONE;
  day_of_week INTEGER;
BEGIN
  cet_time := NOW() AT TIME ZONE 'Europe/Paris';
  target_time := DATE_TRUNC('day', cet_time) + INTERVAL '20 hours';
  
  IF is_weekly THEN
    day_of_week := EXTRACT(DOW FROM cet_time);
    IF day_of_week = 0 THEN
      IF cet_time >= target_time THEN
        target_time := target_time + INTERVAL '7 days';
      END IF;
    ELSE
      target_time := target_time + ((7 - day_of_week) || ' days')::INTERVAL;
    END IF;
  ELSE
    IF cet_time >= target_time THEN
      target_time := target_time + INTERVAL '1 day';
    END IF;
  END IF;
  
  RETURN target_time AT TIME ZONE 'Europe/Paris';
END;
$$ LANGUAGE plpgsql 
SET search_path = public
SECURITY DEFINER;