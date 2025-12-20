-- Stock content sales tracking
CREATE TABLE public.stock_content_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.stock_content_items(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id),
  buyer_email TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  creator_earning DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Creator earnings tracking
CREATE TABLE public.stock_creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Withdrawal requests
CREATE TABLE public.stock_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stock content notifications (for creators and admin)
CREATE TABLE public.stock_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_content_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_content_sales
CREATE POLICY "Creators can view their sales" ON public.stock_content_sales
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Buyers can view their purchases" ON public.stock_content_sales
  FOR SELECT USING (auth.uid() = buyer_id);

-- RLS Policies for stock_creator_earnings
CREATE POLICY "Creators can view their earnings" ON public.stock_creator_earnings
  FOR SELECT USING (auth.uid() = creator_id);

-- RLS Policies for stock_withdrawal_requests
CREATE POLICY "Creators can view their withdrawal requests" ON public.stock_withdrawal_requests
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create withdrawal requests" ON public.stock_withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- RLS Policies for stock_notifications
CREATE POLICY "Users can view their notifications" ON public.stock_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.stock_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update earnings timestamp
CREATE OR REPLACE FUNCTION public.update_stock_creator_earnings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_stock_creator_earnings_updated_at
  BEFORE UPDATE ON public.stock_creator_earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_creator_earnings_timestamp();

-- Function to update withdrawal requests timestamp
CREATE OR REPLACE FUNCTION public.update_stock_withdrawal_requests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_stock_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.stock_withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_withdrawal_requests_timestamp();