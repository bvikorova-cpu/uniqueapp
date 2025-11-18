-- Add earning fields to influencer_profiles
ALTER TABLE public.influencer_profiles
ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0;

-- Create influencer_gifts table
CREATE TABLE IF NOT EXISTS public.influencer_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default gifts for influencers
INSERT INTO public.influencer_gifts (name, description, icon, price, is_active) VALUES
('Coffee', 'Buy the influencer a coffee', '☕', 3.00, true),
('Flower', 'Send a beautiful flower', '🌸', 5.00, true),
('Heart', 'Show your love and support', '❤️', 10.00, true),
('Star', 'You''re a star!', '⭐', 15.00, true),
('Trophy', 'Champion content creator', '🏆', 25.00, true),
('Diamond', 'Premium supporter badge', '💎', 50.00, true),
('Crown', 'The ultimate gift', '👑', 100.00, true)
ON CONFLICT DO NOTHING;

-- Create influencer_sent_gifts table
CREATE TABLE IF NOT EXISTS public.influencer_sent_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES public.influencer_gifts(id),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  chef_amount DECIMAL(10,2),
  platform_commission DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create influencer_platform_earnings table
CREATE TABLE IF NOT EXISTS public.influencer_platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES public.influencer_sent_gifts(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  influencer_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- Create influencer_withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.influencer_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'paypal')),
  payment_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_sent_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_platform_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for influencer_gifts
CREATE POLICY "Anyone can view active gifts"
  ON public.influencer_gifts FOR SELECT
  USING (is_active = true);

-- Policies for influencer_sent_gifts
CREATE POLICY "Users can view their sent gifts"
  ON public.influencer_sent_gifts FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Influencers can view gifts sent to them"
  ON public.influencer_sent_gifts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.influencer_profiles
    WHERE id = influencer_sent_gifts.influencer_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert sent gifts"
  ON public.influencer_sent_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policies for influencer_platform_earnings
CREATE POLICY "Admins can view all platform earnings"
  ON public.influencer_platform_earnings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can insert platform earnings"
  ON public.influencer_platform_earnings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update platform earnings"
  ON public.influencer_platform_earnings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Policies for influencer_withdrawal_requests
CREATE POLICY "Influencers can view their own withdrawal requests"
  ON public.influencer_withdrawal_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.influencer_profiles
    WHERE id = influencer_withdrawal_requests.influencer_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Influencers can insert withdrawal requests"
  ON public.influencer_withdrawal_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.influencer_profiles
    WHERE id = influencer_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.influencer_withdrawal_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update withdrawal requests"
  ON public.influencer_withdrawal_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Function to record influencer commissions
CREATE OR REPLACE FUNCTION public.record_influencer_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_influencer_amount DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_rate DECIMAL(5,2);
BEGIN
  v_rate := COALESCE(NEW.commission_rate, 20.00);
  v_commission := NEW.amount * (v_rate / 100);
  v_influencer_amount := NEW.amount - v_commission;
  
  NEW.influencer_amount := v_influencer_amount;
  NEW.platform_commission := v_commission;
  NEW.commission_rate := v_rate;
  
  IF NEW.status = 'completed' THEN
    INSERT INTO public.influencer_platform_earnings (
      gift_id,
      total_amount,
      influencer_amount,
      commission_amount,
      commission_rate,
      status
    ) VALUES (
      NEW.id,
      NEW.amount,
      v_influencer_amount,
      v_commission,
      v_rate,
      'pending'
    )
    ON CONFLICT (gift_id) DO NOTHING;
    
    -- Update influencer balance
    UPDATE public.influencer_profiles
    SET 
      pending_balance = pending_balance + v_influencer_amount,
      lifetime_earnings = lifetime_earnings + v_influencer_amount
    WHERE id = NEW.influencer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for recording commissions
DROP TRIGGER IF EXISTS record_influencer_commission_trigger ON public.influencer_sent_gifts;
CREATE TRIGGER record_influencer_commission_trigger
  BEFORE INSERT OR UPDATE ON public.influencer_sent_gifts
  FOR EACH ROW
  EXECUTE FUNCTION public.record_influencer_commission();

-- Function to process influencer withdrawal
CREATE OR REPLACE FUNCTION public.process_influencer_withdrawal(
  p_request_id UUID,
  p_admin_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_influencer_id UUID;
  v_amount DECIMAL(10,2);
BEGIN
  SELECT influencer_id, amount INTO v_influencer_id, v_amount
  FROM public.influencer_withdrawal_requests
  WHERE id = p_request_id;
  
  UPDATE public.influencer_withdrawal_requests
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  IF p_status = 'completed' THEN
    UPDATE public.influencer_profiles
    SET 
      pending_balance = pending_balance - v_amount,
      total_withdrawn = total_withdrawn + v_amount
    WHERE id = v_influencer_id;
  END IF;
END;
$$;