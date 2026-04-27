-- P1 SECURITY FIX: Restrict misconfigured "Service role" policies to actual service_role
-- These policies were exposed to public/authenticated, allowing anyone to insert/update
-- sensitive payment, credit, and subscription tables.

-- campaign_payments
DROP POLICY IF EXISTS "Service role can manage payments" ON public.campaign_payments;
CREATE POLICY "Service role can manage payments" ON public.campaign_payments
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- concert_song_requests (was authenticated → only service_role should insert from edge fn)
DROP POLICY IF EXISTS "Service role can insert song requests" ON public.concert_song_requests;
CREATE POLICY "Service role can insert song requests" ON public.concert_song_requests
  AS PERMISSIVE FOR INSERT TO service_role WITH CHECK (true);

-- crystal_chakra_days
DROP POLICY IF EXISTS "Service role can manage chakra days" ON public.crystal_chakra_days;
CREATE POLICY "Service role can manage chakra days" ON public.crystal_chakra_days
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- crystal_purchases
DROP POLICY IF EXISTS "Service role can insert crystal purchases" ON public.crystal_purchases;
CREATE POLICY "Service role can insert crystal purchases" ON public.crystal_purchases
  AS PERMISSIVE FOR INSERT TO service_role WITH CHECK (true);

-- f1_subscriptions
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.f1_subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.f1_subscriptions
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- f1_user_credits
DROP POLICY IF EXISTS "Service role can manage credits" ON public.f1_user_credits;
CREATE POLICY "Service role can manage credits" ON public.f1_user_credits
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- payment_records
DROP POLICY IF EXISTS "Service role manages payments" ON public.payment_records;
CREATE POLICY "Service role manages payments" ON public.payment_records
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- payment_verifications
DROP POLICY IF EXISTS "Service role only" ON public.payment_verifications;
CREATE POLICY "Service role only" ON public.payment_verifications
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);