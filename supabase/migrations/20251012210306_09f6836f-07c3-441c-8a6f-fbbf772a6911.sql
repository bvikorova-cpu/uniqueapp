-- Create referral codes table
CREATE TABLE public.megatalent_referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.megatalent_referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own referral code"
  ON public.megatalent_referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
  ON public.megatalent_referral_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view codes for validation"
  ON public.megatalent_referral_codes
  FOR SELECT
  USING (true);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM megatalent_referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create index for faster code lookups
CREATE INDEX idx_megatalent_referral_codes_code 
  ON public.megatalent_referral_codes(code);