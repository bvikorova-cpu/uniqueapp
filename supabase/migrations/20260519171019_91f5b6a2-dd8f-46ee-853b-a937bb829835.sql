-- 1. Fix function search_path
CREATE OR REPLACE FUNCTION public.br_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin new.updated_at = now(); return new; end
$function$;

-- 2. Lock down iq_promo_codes (RLS was on but no policy existed)
CREATE POLICY "Admins can view promo codes"
ON public.iq_promo_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage promo codes"
ON public.iq_promo_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));