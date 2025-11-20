-- Update default coins value to 0 for comedy currency
ALTER TABLE comedy_currency 
ALTER COLUMN coins SET DEFAULT 0;

-- Update existing users to have 0 coins (optional - if you want to reset everyone)
UPDATE comedy_currency SET coins = 0 WHERE coins = 100;