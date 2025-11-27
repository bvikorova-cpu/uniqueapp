-- P1 KRITICKÉ OPRAVY RLS POLITÍK

-- 1. Oprava bazaar_transactions - UPDATE môže len admin/service_role
DROP POLICY IF EXISTS "System can update transaction status" ON public.bazaar_transactions;
CREATE POLICY "Only admins can update transaction status" 
ON public.bazaar_transactions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Oprava comedian_earnings - UPDATE len pre vlastné záznamy cez comedian_id
DROP POLICY IF EXISTS "Comedians can update their own earnings" ON public.comedian_earnings;
CREATE POLICY "System updates comedian earnings" 
ON public.comedian_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Oprava INSERT - len service role alebo cez edge funkciu
DROP POLICY IF EXISTS "Comedians can insert their own earnings" ON public.comedian_earnings;
CREATE POLICY "System can insert comedian earnings" 
ON public.comedian_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 3. Oprava sports_platform_earnings
DROP POLICY IF EXISTS "Tipsters can update sports platform earnings" ON public.sports_platform_earnings;
CREATE POLICY "Only admins can update sports earnings" 
ON public.sports_platform_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Tipsters can insert sports platform earnings" ON public.sports_platform_earnings;
CREATE POLICY "System can insert sports earnings" 
ON public.sports_platform_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 4. Oprava masterchef_platform_earnings
DROP POLICY IF EXISTS "System can update masterchef platform earnings" ON public.masterchef_platform_earnings;
CREATE POLICY "Only admins can update masterchef earnings" 
ON public.masterchef_platform_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "System can insert masterchef platform earnings" ON public.masterchef_platform_earnings;
CREATE POLICY "System can insert masterchef earnings" 
ON public.masterchef_platform_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 5. Oprava megatalent_referral_earnings - INSERT len service_role
DROP POLICY IF EXISTS "System can create referral earnings" ON public.megatalent_referral_earnings;
CREATE POLICY "System can create referral earnings" 
ON public.megatalent_referral_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 6. Oprava influencer_earnings - INSERT len service_role
DROP POLICY IF EXISTS "System can insert earnings" ON public.influencer_earnings;
CREATE POLICY "System can insert influencer earnings" 
ON public.influencer_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Pridaj UPDATE politiku pre influencer_earnings (len admin)
CREATE POLICY "Only admins can update influencer earnings" 
ON public.influencer_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));