-- Create time_capsule_purchases table to track all time capsule purchases
CREATE TABLE IF NOT EXISTS public.time_capsule_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL, -- 'one_year', 'five_years', 'ten_years', 'twenty_years', 'premium_subscription'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  stripe_session_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  duration_years INTEGER, -- null for premium subscription
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.time_capsule_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time capsule purchases"
  ON public.time_capsule_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time capsule purchases"
  ON public.time_capsule_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Drop existing function if it exists and recreate
DROP FUNCTION IF EXISTS public.has_holographic_access(uuid, text);

CREATE OR REPLACE FUNCTION public.has_holographic_access(
  p_user_id UUID,
  p_service_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.holographic_purchases
    WHERE user_id = p_user_id
      AND service_type = p_service_type
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Create helper function to check time capsule access
CREATE OR REPLACE FUNCTION public.has_time_capsule_access(
  p_user_id UUID,
  p_service_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.time_capsule_purchases
    WHERE user_id = p_user_id
      AND service_type = p_service_type
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_capsule_purchases_user_id ON public.time_capsule_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_time_capsule_purchases_status ON public.time_capsule_purchases(status);
CREATE INDEX IF NOT EXISTS idx_holographic_purchases_user_id ON public.holographic_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_holographic_purchases_status ON public.holographic_purchases(status);