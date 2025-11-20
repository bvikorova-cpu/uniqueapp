-- Add last_daily_claim column to horse_currency table
ALTER TABLE horse_currency ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMPTZ;