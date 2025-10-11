-- Create featured listings table
CREATE TABLE public.featured_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('bazaar', 'auction')),
  item_id UUID NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  price NUMERIC(10,2) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI credits table
CREATE TABLE public.ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create AI usage history table
CREATE TABLE public.ai_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('image_generation', 'avatar', 'effect', 'course')),
  credits_used INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for featured_listings
CREATE POLICY "Anyone can view active featured listings"
  ON public.featured_listings FOR SELECT
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can create their own featured listings"
  ON public.featured_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own featured listings"
  ON public.featured_listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all featured listings"
  ON public.featured_listings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_credits
CREATE POLICY "Users can view their own credits"
  ON public.ai_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.ai_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.ai_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits"
  ON public.ai_credits FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_usage_history
CREATE POLICY "Users can view their own usage history"
  ON public.ai_usage_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create usage records"
  ON public.ai_usage_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage history"
  ON public.ai_usage_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create function to update ai_credits timestamp
CREATE OR REPLACE FUNCTION public.update_ai_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for ai_credits
CREATE TRIGGER update_ai_credits_timestamp
  BEFORE UPDATE ON public.ai_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_credits_updated_at();

-- Create function to automatically expire featured listings
CREATE OR REPLACE FUNCTION public.expire_featured_listings()
RETURNS void AS $$
BEGIN
  UPDATE public.featured_listings
  SET is_active = false
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;