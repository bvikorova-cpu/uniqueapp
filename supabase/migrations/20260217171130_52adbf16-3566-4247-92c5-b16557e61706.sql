
-- Table to track purchased crystal services
CREATE TABLE public.crystal_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.crystal_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crystal purchases"
ON public.crystal_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert crystal purchases"
ON public.crystal_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Table for chakra balancing daily content
CREATE TABLE public.crystal_chakra_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.crystal_purchases(id),
  user_id UUID NOT NULL,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  chakra_name TEXT NOT NULL,
  content TEXT,
  meditation_guide TEXT,
  crystal_recommendation TEXT,
  is_unlocked BOOLEAN DEFAULT false,
  unlock_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crystal_chakra_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chakra days"
ON public.crystal_chakra_days FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage chakra days"
ON public.crystal_chakra_days FOR ALL
USING (auth.uid() = user_id);

-- Index for efficient lookups
CREATE INDEX idx_crystal_purchases_user ON public.crystal_purchases(user_id, feature_key);
CREATE INDEX idx_crystal_chakra_days_purchase ON public.crystal_chakra_days(purchase_id, day_number);
