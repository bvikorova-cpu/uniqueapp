-- Update megatalent_tier enum to only have premium and top_premium
ALTER TYPE megatalent_tier RENAME TO megatalent_tier_old;

CREATE TYPE megatalent_tier AS ENUM ('premium', 'top_premium');

ALTER TABLE megatalent_subscriptions 
  ALTER COLUMN tier DROP DEFAULT,
  ALTER COLUMN tier TYPE megatalent_tier USING tier::text::megatalent_tier,
  ALTER COLUMN tier SET DEFAULT 'premium'::megatalent_tier;

DROP TYPE megatalent_tier_old;

-- Update the trigger function to handle both tiers correctly
CREATE OR REPLACE FUNCTION add_premium_bonus_votes()
RETURNS TRIGGER AS $$
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