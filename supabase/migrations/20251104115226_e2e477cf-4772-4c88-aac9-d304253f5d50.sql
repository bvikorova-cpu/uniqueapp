-- Add commission tracking to sent gifts
ALTER TABLE public.masterchef_sent_gifts
ADD COLUMN IF NOT EXISTS chef_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 20.00;

-- Create table for platform earnings
CREATE TABLE IF NOT EXISTS public.masterchef_platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES public.masterchef_sent_gifts(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  chef_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gift_id)
);

-- Enable RLS
ALTER TABLE public.masterchef_platform_earnings ENABLE ROW LEVEL SECURITY;

-- Policy for platform earnings (only admins can view)
CREATE POLICY "Only admins can view platform earnings"
ON public.masterchef_platform_earnings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to calculate and record commission
CREATE OR REPLACE FUNCTION public.record_masterchef_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chef_amount DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_rate DECIMAL(5,2);
BEGIN
  -- Get commission rate (default 20%)
  v_rate := COALESCE(NEW.commission_rate, 20.00);
  
  -- Calculate amounts
  v_commission := NEW.amount * (v_rate / 100);
  v_chef_amount := NEW.amount - v_commission;
  
  -- Update the gift record
  NEW.chef_amount := v_chef_amount;
  NEW.platform_commission := v_commission;
  NEW.commission_rate := v_rate;
  
  -- Record platform earning when status is completed
  IF NEW.status = 'completed' THEN
    INSERT INTO public.masterchef_platform_earnings (
      gift_id,
      total_amount,
      chef_amount,
      commission_amount,
      commission_rate,
      status
    ) VALUES (
      NEW.id,
      NEW.amount,
      v_chef_amount,
      v_commission,
      v_rate,
      'pending'
    )
    ON CONFLICT (gift_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to calculate commission on insert/update
DROP TRIGGER IF EXISTS calculate_masterchef_commission ON public.masterchef_sent_gifts;
CREATE TRIGGER calculate_masterchef_commission
BEFORE INSERT OR UPDATE ON public.masterchef_sent_gifts
FOR EACH ROW
EXECUTE FUNCTION public.record_masterchef_commission();