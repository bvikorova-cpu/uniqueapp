-- Update competition times to match countdown (20:00 CET daily and weekly Sunday)
-- First, remove existing sample competitions
DELETE FROM public.iq_competitions WHERE title IN ('Daily IQ Challenge', 'Weekly Grand Tournament', 'Premium Championship');

-- Helper function to get next 20:00 CET
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
    -- Get next Sunday at 20:00
    day_of_week := EXTRACT(DOW FROM cet_time);
    IF day_of_week = 0 THEN
      -- It's Sunday, check if we're past 20:00
      IF cet_time >= target_time THEN
        target_time := target_time + INTERVAL '7 days';
      END IF;
    ELSE
      -- Add days until Sunday
      target_time := target_time + ((7 - day_of_week) || ' days')::INTERVAL;
    END IF;
  ELSE
    -- Daily: if past 20:00 today, set to tomorrow
    IF cet_time >= target_time THEN
      target_time := target_time + INTERVAL '1 day';
    END IF;
  END IF;
  
  RETURN target_time AT TIME ZONE 'Europe/Paris';
END;
$$ LANGUAGE plpgsql;

-- Insert competitions with proper times
INSERT INTO public.iq_competitions (title, description, entry_fee, prize_pool, max_participants, status, start_time, end_time)
VALUES 
  ('Daily IQ Challenge', 'Quick 15-minute daily competition - Ends every day at 20:00 CET', 5, 250, 200, 'active', NOW(), get_next_20_cet(FALSE)),
  ('Weekly Grand Tournament', '60-minute comprehensive test - Ends every Sunday at 20:00 CET', 20, 1500, 100, 'active', NOW(), get_next_20_cet(TRUE)),
  ('Premium Championship', 'Expert level competition', 50, 5000, 50, 'upcoming', NOW() + INTERVAL '12 hours', NOW() + INTERVAL '1 day');