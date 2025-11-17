-- Create masterchef_withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.masterchef_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 10),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'paypal')),
  payment_details JSONB,
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.masterchef_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for chefs to view their own requests
CREATE POLICY "Chefs can view their own withdrawal requests"
  ON public.masterchef_withdrawal_requests
  FOR SELECT
  USING (auth.uid() = chef_id);

-- Policies for chefs to create their own requests
CREATE POLICY "Chefs can create their own withdrawal requests"
  ON public.masterchef_withdrawal_requests
  FOR INSERT
  WITH CHECK (auth.uid() = chef_id AND status = 'pending');

-- Policies for admins to view all requests
CREATE POLICY "Admins can view all withdrawal requests"
  ON public.masterchef_withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for admins to update requests
CREATE POLICY "Admins can update withdrawal requests"
  ON public.masterchef_withdrawal_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to process masterchef withdrawal requests
CREATE OR REPLACE FUNCTION public.process_masterchef_withdrawal(
  p_request_id UUID,
  p_admin_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can process withdrawal requests';
  END IF;

  -- Verify valid status
  IF p_status NOT IN ('approved', 'rejected', 'completed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  -- Update the withdrawal request
  UPDATE public.masterchef_withdrawal_requests
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    processed_by = p_admin_id,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

END;
$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_masterchef_withdrawal_requests_chef_id 
  ON public.masterchef_withdrawal_requests(chef_id);
CREATE INDEX IF NOT EXISTS idx_masterchef_withdrawal_requests_status 
  ON public.masterchef_withdrawal_requests(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_masterchef_withdrawal_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_masterchef_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.masterchef_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_masterchef_withdrawal_requests_updated_at();