-- Comedy Club Platform Earnings System (like MasterChef)

-- Add storage bucket for comedy videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comedy-videos', 'comedy-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for comedy videos
CREATE POLICY "Anyone can view comedy videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'comedy-videos');

CREATE POLICY "Comedians can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'comedy-videos' AND
  auth.uid() IN (SELECT user_id FROM public.comedian_profiles)
);

CREATE POLICY "Comedians can update their own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'comedy-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Comedians can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'comedy-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add commission tracking to comedian earnings
ALTER TABLE public.comedian_earnings
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 25.00,
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2);

-- Create table for comedy platform earnings
CREATE TABLE IF NOT EXISTS public.comedy_platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ticket_sale', 'tip', 'clip_sale', 'battle_prize')),
  total_amount DECIMAL(10,2) NOT NULL,
  comedian_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  related_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.comedy_platform_earnings ENABLE ROW LEVEL SECURITY;

-- Policy for platform earnings (only admins can view)
CREATE POLICY "Only admins can view comedy platform earnings"
ON public.comedy_platform_earnings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add pending_payout column to comedian_earnings
ALTER TABLE public.comedian_earnings
ADD COLUMN IF NOT EXISTS pending_payout DECIMAL(10,2) DEFAULT 0;

-- Function to record platform earnings
CREATE OR REPLACE FUNCTION record_comedy_platform_earning()
RETURNS TRIGGER AS $$
DECLARE
  v_comedian_amount DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_rate DECIMAL(5,2);
BEGIN
  -- Get commission rate (default 25%)
  v_rate := COALESCE(NEW.commission_rate, 25.00);
  
  -- Calculate amounts
  v_commission := NEW.total_earned * (v_rate / 100);
  v_comedian_amount := NEW.total_earned - v_commission;
  
  -- Update comedian earnings
  NEW.platform_commission := v_commission;
  NEW.net_amount := v_comedian_amount;
  NEW.commission_rate := v_rate;
  
  -- Add to pending payout
  UPDATE public.comedian_earnings
  SET pending_payout = pending_payout + v_comedian_amount
  WHERE comedian_id = NEW.comedian_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for recording earnings
CREATE TRIGGER record_comedy_earning_trigger
BEFORE INSERT ON public.comedian_earnings
FOR EACH ROW
EXECUTE FUNCTION record_comedy_platform_earning();

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS public.comedian_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  admin_notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.comedian_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for withdrawal requests
CREATE POLICY "Comedians can view their own withdrawal requests"
ON public.comedian_withdrawal_requests
FOR SELECT
USING (
  comedian_id IN (SELECT id FROM public.comedian_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Comedians can create withdrawal requests"
ON public.comedian_withdrawal_requests
FOR INSERT
WITH CHECK (
  comedian_id IN (SELECT id FROM public.comedian_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all withdrawal requests"
ON public.comedian_withdrawal_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);