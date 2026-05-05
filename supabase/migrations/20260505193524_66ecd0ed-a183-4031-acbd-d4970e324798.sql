
ALTER TABLE public.dating_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS dating_subscriptions_user_id_key ON public.dating_subscriptions(user_id);
