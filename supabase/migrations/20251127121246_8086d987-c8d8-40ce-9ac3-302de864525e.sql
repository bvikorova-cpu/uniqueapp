-- P1 KRITICKÉ OPRAVY - DRUHÁ VLNA

-- 1. comedy_platform_earnings - kritické zárobky
DROP POLICY IF EXISTS "System can update comedy platform earnings" ON public.comedy_platform_earnings;
CREATE POLICY "Only admins can update comedy platform earnings" 
ON public.comedy_platform_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. escape_room_earnings - kritické zárobky
DROP POLICY IF EXISTS "Creators can update escape room earnings" ON public.escape_room_earnings;
CREATE POLICY "Only admins can update escape room earnings" 
ON public.escape_room_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. influencer_balances - KRITICKÉ zostatky
DROP POLICY IF EXISTS "Influencers can update their own balance" ON public.influencer_balances;
CREATE POLICY "Only admins can update influencer balances" 
ON public.influencer_balances 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. payout_batches - kritické pre výplaty
DROP POLICY IF EXISTS "System can update payout batches" ON public.payout_batches;
CREATE POLICY "Only admins can update payout batches" 
ON public.payout_batches 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. stock_content_earnings - kritické zárobky
DROP POLICY IF EXISTS "Creators can update stock content earnings" ON public.stock_content_earnings;
CREATE POLICY "Only admins can update stock content earnings" 
ON public.stock_content_earnings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. home_decor_sales - finančné dáta
DROP POLICY IF EXISTS "System can update home decor sales" ON public.home_decor_sales;
CREATE POLICY "Only admins can update home decor sales" 
ON public.home_decor_sales 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. comedy_battles - menej kritické ale treba opraviť
DROP POLICY IF EXISTS "Users can update comedy battles" ON public.comedy_battles;
CREATE POLICY "Only admins can update comedy battles" 
ON public.comedy_battles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));