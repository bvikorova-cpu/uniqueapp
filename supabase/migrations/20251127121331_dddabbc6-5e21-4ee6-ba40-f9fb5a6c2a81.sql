-- P1 KRITICKÉ OPRAVY - TRETIA VLNA (INSERT politiky)

-- 1. comedy_platform_earnings - INSERT len service_role
DROP POLICY IF EXISTS "System can insert comedy platform earnings" ON public.comedy_platform_earnings;
CREATE POLICY "System can insert comedy platform earnings" 
ON public.comedy_platform_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 2. escape_room_earnings - INSERT len service_role
DROP POLICY IF EXISTS "Creators can insert escape room earnings" ON public.escape_room_earnings;
CREATE POLICY "System can insert escape room earnings" 
ON public.escape_room_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 3. influencer_balances - INSERT len service_role
DROP POLICY IF EXISTS "Influencers can insert their own balance" ON public.influencer_balances;
CREATE POLICY "System can insert influencer balances" 
ON public.influencer_balances 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 4. instructor_payout_history - INSERT len service_role
DROP POLICY IF EXISTS "System can insert payout history" ON public.instructor_payout_history;
CREATE POLICY "System can insert payout history" 
ON public.instructor_payout_history 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 5. payout_batches - INSERT len service_role
DROP POLICY IF EXISTS "System can insert payout batches" ON public.payout_batches;
CREATE POLICY "System can insert payout batches" 
ON public.payout_batches 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 6. stock_content_earnings - INSERT len service_role
DROP POLICY IF EXISTS "Creators can insert stock content earnings" ON public.stock_content_earnings;
CREATE POLICY "System can insert stock content earnings" 
ON public.stock_content_earnings 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 7. bazaar_transactions - INSERT len service_role (systém vytvára transakcie)
DROP POLICY IF EXISTS "System can insert transactions" ON public.bazaar_transactions;
CREATE POLICY "System can insert bazaar transactions" 
ON public.bazaar_transactions 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 8. credit_payments - INSERT len service_role
DROP POLICY IF EXISTS "Service role can insert payment records" ON public.credit_payments;
CREATE POLICY "System can insert credit payments" 
ON public.credit_payments 
FOR INSERT 
TO service_role
WITH CHECK (true);