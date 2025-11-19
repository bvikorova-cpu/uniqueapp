-- Remove default credits and set back to 0
UPDATE photo_credits 
SET credits_remaining = 0,
    updated_at = now()
WHERE credits_remaining = 5 AND total_credits_purchased = 0;

-- Set default value for new records to 0 credits
ALTER TABLE photo_credits 
ALTER COLUMN credits_remaining SET DEFAULT 0;