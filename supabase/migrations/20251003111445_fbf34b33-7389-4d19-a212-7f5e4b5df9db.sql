-- Fix search_path for add_premium_bonus_votes function
CREATE OR REPLACE FUNCTION add_premium_bonus_votes()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add bonus votes when a vote is cast by a user with an active subscription
  UPDATE talent_submissions ts
  SET votes_count = votes_count + COALESCE(
    (SELECT ms.bonus_votes 
     FROM megatalent_subscriptions ms 
     WHERE ms.user_id = NEW.user_id 
       AND ms.status = 'active'
       AND (ms.expires_at IS NULL OR ms.expires_at > NOW())
       AND ms.tier IN ('premium', 'top_premium')
     LIMIT 1), 
    0
  ) + 1
  WHERE ts.id = NEW.submission_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;