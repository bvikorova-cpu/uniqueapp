-- Add paid_at and admin_notes columns to masterchef_platform_earnings
ALTER TABLE public.masterchef_platform_earnings
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;