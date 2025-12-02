-- Create past life credits table
CREATE TABLE IF NOT EXISTS public.past_life_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create past life readings table
CREATE TABLE IF NOT EXISTS public.past_life_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE NOT NULL,
  dreams_dejavu TEXT,
  talents_phobias TEXT,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('basic', 'full', 'soulmate')),
  credits_used INTEGER NOT NULL,
  past_lives JSONB NOT NULL,
  karmic_lessons TEXT,
  soulmate_analysis TEXT,
  partner_birth_date DATE,
  partner_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.past_life_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for past_life_credits
CREATE POLICY "Users can view their own past life credits"
  ON public.past_life_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own past life credits"
  ON public.past_life_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own past life credits"
  ON public.past_life_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for past_life_readings
CREATE POLICY "Users can view their own past life readings"
  ON public.past_life_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own past life readings"
  ON public.past_life_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_past_life_credits_user_id ON public.past_life_credits(user_id);
CREATE INDEX idx_past_life_readings_user_id ON public.past_life_readings(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_past_life_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER past_life_credits_updated_at
  BEFORE UPDATE ON public.past_life_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_past_life_credits_updated_at();