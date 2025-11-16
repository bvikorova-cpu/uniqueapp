-- Add stripe_session_id column to property_lead_boost_purchases table
ALTER TABLE public.property_lead_boost_purchases
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;