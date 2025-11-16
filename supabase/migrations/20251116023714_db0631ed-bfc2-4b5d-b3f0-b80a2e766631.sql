-- Create creator_content_packs table for custom pricing
CREATE TABLE IF NOT EXISTS public.creator_content_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_count INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('photos', 'videos', 'mixed')),
  price DECIMAL(10,2) NOT NULL,
  preview_urls TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create creator_content_purchases table
CREATE TABLE IF NOT EXISTS public.creator_content_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.creator_content_packs(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  creator_earning DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_content_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_content_packs
CREATE POLICY "Anyone can view active content packs"
  ON public.creator_content_packs
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators can manage their own packs"
  ON public.creator_content_packs
  FOR ALL
  USING (auth.uid() = creator_id);

-- RLS Policies for creator_content_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.creator_content_purchases
  FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Creators can view their sales"
  ON public.creator_content_purchases
  FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "System can insert purchases"
  ON public.creator_content_purchases
  FOR INSERT
  WITH CHECK (true);

-- Add social_links to creator_profiles
ALTER TABLE public.creator_profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_packs_creator ON public.creator_content_packs(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_buyer ON public.creator_content_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_creator ON public.creator_content_purchases(creator_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_content_packs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_packs_updated_at
  BEFORE UPDATE ON public.creator_content_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_content_packs_timestamp();