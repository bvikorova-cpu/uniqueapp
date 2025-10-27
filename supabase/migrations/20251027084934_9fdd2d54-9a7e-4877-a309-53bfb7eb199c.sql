-- Create collectible_purchases table for tracking purchased mystery boxes and items
CREATE TABLE IF NOT EXISTS public.collectible_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('mystery_box_basic', 'mystery_box_premium', 'exclusive_collection', 'creator_card')),
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vip_subscriptions table for tracking VIP access
CREATE TABLE IF NOT EXISTS public.vip_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collectible_purchases_user_id ON public.collectible_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_collectible_purchases_status ON public.collectible_purchases(status);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_user_id ON public.vip_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_status ON public.vip_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.collectible_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collectible_purchases
CREATE POLICY "Users can view their own purchases" 
  ON public.collectible_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
  ON public.collectible_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vip_subscriptions
CREATE POLICY "Users can view their own VIP status" 
  ON public.vip_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create function to check VIP status
CREATE OR REPLACE FUNCTION public.is_vip_user(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.vip_subscriptions
    WHERE user_id = user_id_param
      AND status = 'active'
      AND current_period_end > NOW()
  );
END;
$$;

-- Create function to update vip subscription timestamp
CREATE OR REPLACE FUNCTION public.update_vip_subscription_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for vip_subscriptions updated_at
DROP TRIGGER IF EXISTS update_vip_subscriptions_updated_at ON public.vip_subscriptions;
CREATE TRIGGER update_vip_subscriptions_updated_at
  BEFORE UPDATE ON public.vip_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vip_subscription_timestamp();