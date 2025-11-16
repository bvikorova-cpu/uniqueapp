-- Add 18+ content support and platform commission settings
ALTER TABLE public.creator_profiles
ADD COLUMN IF NOT EXISTS is_adult_content BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS platform_commission_rate NUMERIC DEFAULT 0.10;

ALTER TABLE public.creator_exclusive_posts
ADD COLUMN IF NOT EXISTS is_adult_content BOOLEAN DEFAULT false;

-- Add comment explaining commission
COMMENT ON COLUMN public.creator_profiles.platform_commission_rate IS 'Platform commission rate (0.10 = 10%, creator gets 90%)';

-- Update existing creator profiles to have 10% commission
UPDATE public.creator_profiles
SET platform_commission_rate = 0.10
WHERE platform_commission_rate IS NULL;