
CREATE TABLE public.megatalent_vip_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'vip_viewer',
  status text NOT NULL DEFAULT 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.megatalent_vip_viewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vip"
ON public.megatalent_vip_viewers FOR SELECT
USING (auth.uid() = user_id);

CREATE TRIGGER set_megatalent_vip_viewers_updated_at
BEFORE UPDATE ON public.megatalent_vip_viewers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_megatalent_vip(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.megatalent_vip_viewers
    WHERE user_id = _user_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;
