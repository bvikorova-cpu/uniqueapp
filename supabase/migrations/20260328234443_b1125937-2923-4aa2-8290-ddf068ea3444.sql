CREATE TABLE public.phobia_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining integer NOT NULL DEFAULT 5,
  total_credits_purchased integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.phobia_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phobia credits" ON public.phobia_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phobia credits" ON public.phobia_credits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own phobia credits" ON public.phobia_credits FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.phobia_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'inactive',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.phobia_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phobia subscriptions" ON public.phobia_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phobia subscriptions" ON public.phobia_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own phobia subscriptions" ON public.phobia_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);