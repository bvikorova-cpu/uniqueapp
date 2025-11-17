-- Create phobia purchases table
CREATE TABLE IF NOT EXISTS public.phobia_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user phobias table
CREATE TABLE IF NOT EXISTS public.user_phobias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phobia_name TEXT NOT NULL,
  phobia_type TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  ai_analysis JSONB,
  source TEXT DEFAULT 'detected',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create phobia trades table
CREATE TABLE IF NOT EXISTS public.phobia_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  buyer_id UUID,
  phobia_id UUID NOT NULL REFERENCES public.user_phobias(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'listed',
  transaction_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create phobia treatments table
CREATE TABLE IF NOT EXISTS public.phobia_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phobia_id UUID NOT NULL REFERENCES public.user_phobias(id) ON DELETE CASCADE,
  treatment_plan JSONB NOT NULL,
  sessions_completed INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 8,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create phobia progress table
CREATE TABLE IF NOT EXISTS public.phobia_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  treatment_id UUID NOT NULL REFERENCES public.phobia_treatments(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  severity_before INTEGER,
  severity_after INTEGER,
  notes TEXT,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phobia_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phobias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phobia_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phobia_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phobia_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phobia_purchases
CREATE POLICY "Users can view own purchases"
  ON public.phobia_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON public.phobia_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_phobias
CREATE POLICY "Users can view own phobias"
  ON public.user_phobias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own phobias"
  ON public.user_phobias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phobias"
  ON public.user_phobias FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own phobias"
  ON public.user_phobias FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for phobia_trades
CREATE POLICY "Users can view own trades"
  ON public.phobia_trades FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Anyone can view listed trades"
  ON public.phobia_trades FOR SELECT
  USING (status = 'listed');

CREATE POLICY "Users can create own trade listings"
  ON public.phobia_trades FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own trades"
  ON public.phobia_trades FOR UPDATE
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- RLS Policies for phobia_treatments
CREATE POLICY "Users can view own treatments"
  ON public.phobia_treatments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own treatments"
  ON public.phobia_treatments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treatments"
  ON public.phobia_treatments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for phobia_progress
CREATE POLICY "Users can view own progress"
  ON public.phobia_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON public.phobia_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_phobia_purchases_user_id ON public.phobia_purchases(user_id);
CREATE INDEX idx_phobia_purchases_status ON public.phobia_purchases(status);
CREATE INDEX idx_user_phobias_user_id ON public.user_phobias(user_id);
CREATE INDEX idx_user_phobias_status ON public.user_phobias(status);
CREATE INDEX idx_phobia_trades_seller ON public.phobia_trades(seller_id);
CREATE INDEX idx_phobia_trades_buyer ON public.phobia_trades(buyer_id);
CREATE INDEX idx_phobia_trades_status ON public.phobia_trades(status);
CREATE INDEX idx_phobia_treatments_user_id ON public.phobia_treatments(user_id);
CREATE INDEX idx_phobia_progress_user_id ON public.phobia_progress(user_id);

-- Create function to check if user has access to phobia services
CREATE OR REPLACE FUNCTION public.has_phobia_access(user_id_param UUID, service_type_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.phobia_purchases
    WHERE user_id = user_id_param
    AND service_type = service_type_param
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_phobia_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_phobia_purchases_timestamp
  BEFORE UPDATE ON public.phobia_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_phobia_timestamp();

CREATE TRIGGER update_user_phobias_timestamp
  BEFORE UPDATE ON public.user_phobias
  FOR EACH ROW EXECUTE FUNCTION public.update_phobia_timestamp();

CREATE TRIGGER update_phobia_trades_timestamp
  BEFORE UPDATE ON public.phobia_trades
  FOR EACH ROW EXECUTE FUNCTION public.update_phobia_timestamp();

CREATE TRIGGER update_phobia_treatments_timestamp
  BEFORE UPDATE ON public.phobia_treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_phobia_timestamp();