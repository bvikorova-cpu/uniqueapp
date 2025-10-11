-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'premium', 'business');

-- Create global subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.subscription_tier NOT NULL DEFAULT 'free',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tier)
);

-- Create transactions table for commissions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('auction_sale', 'bazaar_sale', 'marketplace_sale', 'subscription', 'featured_listing')),
  item_id UUID,
  amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

CREATE TRIGGER update_transactions_timestamp
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transactions_updated_at();