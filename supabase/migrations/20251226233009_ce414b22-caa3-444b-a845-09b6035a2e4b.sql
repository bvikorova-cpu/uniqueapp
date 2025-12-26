-- Create table for coupon marketplace access
CREATE TABLE public.coupon_marketplace_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_marketplace_access ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own access" 
ON public.coupon_marketplace_access 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access" 
ON public.coupon_marketplace_access 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_coupon_marketplace_access_user ON public.coupon_marketplace_access(user_id);