-- Create horse_currency table
CREATE TABLE IF NOT EXISTS public.horse_currency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gems INTEGER NOT NULL DEFAULT 100,
  coins INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.horse_currency ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own currency"
  ON public.horse_currency FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own currency"
  ON public.horse_currency FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own currency"
  ON public.horse_currency FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_horse_currency_user ON public.horse_currency(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_horse_currency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_horse_currency_updated_at
  BEFORE UPDATE ON public.horse_currency
  FOR EACH ROW
  EXECUTE FUNCTION update_horse_currency_updated_at();