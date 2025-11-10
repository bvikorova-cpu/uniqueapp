-- Create healthcare_profiles table for subscription tracking
CREATE TABLE IF NOT EXISTS public.healthcare_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT,
  provider_logo_url TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT DEFAULT 'none',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.healthcare_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for healthcare_profiles
CREATE POLICY "Users can view their own healthcare profile"
  ON public.healthcare_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own healthcare profile"
  ON public.healthcare_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own healthcare profile"
  ON public.healthcare_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_healthcare_profiles_updated_at
  BEFORE UPDATE ON public.healthcare_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_healthcare_profiles_user_id ON public.healthcare_profiles(user_id);
CREATE INDEX idx_healthcare_profiles_subscription_status ON public.healthcare_profiles(subscription_status);