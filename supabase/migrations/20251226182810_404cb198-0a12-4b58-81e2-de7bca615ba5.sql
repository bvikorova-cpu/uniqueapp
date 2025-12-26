-- Add monthly message tracking and bonus messages to psychology_subscriptions
ALTER TABLE public.psychology_subscriptions 
ADD COLUMN IF NOT EXISTS monthly_messages_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_messages_reset_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS bonus_messages integer DEFAULT 0;

-- Add bonus messages to best_friend_subscriptions
ALTER TABLE public.best_friend_subscriptions 
ADD COLUMN IF NOT EXISTS bonus_messages integer DEFAULT 0;

-- Create function to reset psychology monthly messages
CREATE OR REPLACE FUNCTION public.reset_psychology_monthly_messages()
RETURNS void AS $$
BEGIN
  UPDATE public.psychology_subscriptions
  SET monthly_messages_used = 0, monthly_messages_reset_at = now()
  WHERE subscription_status = 'active'
    AND (monthly_messages_reset_at IS NULL OR monthly_messages_reset_at < now() - interval '1 month');
END;
$$ LANGUAGE plpgsql SET search_path = public;