
-- Give existing users with 0 credits some free credits for testing
UPDATE photo_credits 
SET credits_remaining = 5,
    updated_at = now()
WHERE credits_remaining = 0;

-- Set default value for new records to 5 credits
ALTER TABLE photo_credits 
ALTER COLUMN credits_remaining SET DEFAULT 5;
