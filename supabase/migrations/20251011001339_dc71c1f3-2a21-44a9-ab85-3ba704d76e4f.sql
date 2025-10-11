-- Add subscription_type column to dating_subscriptions table
ALTER TABLE public.dating_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'monthly' CHECK (subscription_type IN ('monthly', 'yearly'));

-- Update existing records to monthly
UPDATE public.dating_subscriptions 
SET subscription_type = 'monthly' 
WHERE subscription_type IS NULL;