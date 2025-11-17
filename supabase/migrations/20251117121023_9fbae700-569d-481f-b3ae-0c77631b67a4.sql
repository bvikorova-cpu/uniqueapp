-- Create musician earnings tracking table
CREATE TABLE IF NOT EXISTS public.musician_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID NOT NULL REFERENCES public.musician_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ticket_sale', 'gift', 'tip')),
  total_amount DECIMAL(10,2) NOT NULL,
  musician_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create musician withdrawal requests table
CREATE TABLE IF NOT EXISTS public.musician_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID NOT NULL REFERENCES public.musician_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method TEXT,
  payment_details JSONB,
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add pending_balance and other earning fields to musician_profiles
ALTER TABLE public.musician_profiles
ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0 CHECK (pending_balance >= 0),
ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(10,2) DEFAULT 0 CHECK (lifetime_earnings >= 0),
ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0 CHECK (total_withdrawn >= 0);

-- Enable RLS
ALTER TABLE public.musician_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musician_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for musician_earnings
CREATE POLICY "Musicians can view their own earnings"
  ON public.musician_earnings FOR SELECT
  USING (musician_id IN (
    SELECT id FROM public.musician_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all earnings"
  ON public.musician_earnings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for musician_withdrawal_requests
CREATE POLICY "Musicians can view their own withdrawal requests"
  ON public.musician_withdrawal_requests FOR SELECT
  USING (musician_id IN (
    SELECT id FROM public.musician_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Musicians can create withdrawal requests"
  ON public.musician_withdrawal_requests FOR INSERT
  WITH CHECK (musician_id IN (
    SELECT id FROM public.musician_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.musician_withdrawal_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawal requests"
  ON public.musician_withdrawal_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update musician balance on gift/ticket purchase
CREATE OR REPLACE FUNCTION public.record_musician_earning()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.musician_profiles
  SET 
    pending_balance = pending_balance + NEW.musician_amount,
    lifetime_earnings = lifetime_earnings + NEW.musician_amount,
    updated_at = NOW()
  WHERE id = NEW.musician_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically update musician balance
CREATE TRIGGER update_musician_balance_on_earning
  AFTER INSERT ON public.musician_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.record_musician_earning();

-- Function to process withdrawal
CREATE OR REPLACE FUNCTION public.process_musician_withdrawal(
  p_request_id UUID,
  p_admin_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_musician_id UUID;
  v_amount DECIMAL(10,2);
BEGIN
  SELECT musician_id, amount INTO v_musician_id, v_amount
  FROM public.musician_withdrawal_requests
  WHERE id = p_request_id;
  
  UPDATE public.musician_withdrawal_requests
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  IF p_status = 'completed' THEN
    UPDATE public.musician_profiles
    SET 
      pending_balance = pending_balance - v_amount,
      total_withdrawn = total_withdrawn + v_amount,
      updated_at = NOW()
    WHERE id = v_musician_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;