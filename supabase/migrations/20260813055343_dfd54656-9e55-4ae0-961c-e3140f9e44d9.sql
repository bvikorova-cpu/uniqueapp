CREATE TABLE public.masterchef_chef_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pass_type TEXT NOT NULL DEFAULT 'day',
  credits_paid INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.masterchef_chef_passes TO authenticated;
GRANT ALL ON public.masterchef_chef_passes TO service_role;

ALTER TABLE public.masterchef_chef_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chef passes"
ON public.masterchef_chef_passes FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own chef passes"
ON public.masterchef_chef_passes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_masterchef_chef_passes_user_expires
ON public.masterchef_chef_passes (user_id, expires_at DESC);

CREATE TRIGGER update_masterchef_chef_passes_updated_at
BEFORE UPDATE ON public.masterchef_chef_passes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.has_active_chef_pass(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.masterchef_chef_passes
    WHERE user_id = _user_id AND expires_at > now()
  );
$$;