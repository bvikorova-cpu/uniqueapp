
CREATE TABLE IF NOT EXISTS public.beta_whitelist (
  email text PRIMARY KEY,
  note text,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_whitelist TO authenticated;
GRANT ALL ON public.beta_whitelist TO service_role;

ALTER TABLE public.beta_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage beta whitelist"
ON public.beta_whitelist
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function: checks if current authenticated user's email is in whitelist OR is admin
CREATE OR REPLACE FUNCTION public.is_current_user_whitelisted()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN auth.uid() IS NULL THEN false
      WHEN public.has_role(auth.uid(), 'admin') THEN true
      ELSE EXISTS (
        SELECT 1
        FROM public.beta_whitelist bw
        JOIN auth.users u ON lower(u.email) = lower(bw.email)
        WHERE u.id = auth.uid()
      )
    END
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_whitelisted() TO authenticated, anon;

-- Seed test account
INSERT INTO public.beta_whitelist (email, note)
VALUES ('beata.vikorova@yandex.com', 'Owner / test account')
ON CONFLICT (email) DO NOTHING;
