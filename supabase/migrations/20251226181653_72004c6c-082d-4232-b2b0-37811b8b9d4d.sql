-- Add monthly messages tracking for premium subscribers
ALTER TABLE public.best_friend_subscriptions 
ADD COLUMN IF NOT EXISTS monthly_messages_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_messages_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Function to reset monthly messages counter
CREATE OR REPLACE FUNCTION public.reset_best_friend_monthly_messages()
RETURNS void AS $$
BEGIN
  UPDATE public.best_friend_subscriptions
  SET monthly_messages_used = 0,
      monthly_messages_reset_at = now()
  WHERE monthly_messages_reset_at < now() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;