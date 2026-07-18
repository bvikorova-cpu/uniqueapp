
-- 1) bazaar_seller_verifications: restrict SELECT
DROP POLICY IF EXISTS "verifications readable by all" ON public.bazaar_seller_verifications;
DROP POLICY IF EXISTS "Public can view seller verifications" ON public.bazaar_seller_verifications;
DROP POLICY IF EXISTS "Anyone can view verifications" ON public.bazaar_seller_verifications;
CREATE POLICY "Owner or admin can view seller verifications"
ON public.bazaar_seller_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2) contact_messages: enforce owner check on INSERT
DROP POLICY IF EXISTS "Authenticated users can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone authenticated can insert" ON public.contact_messages;
CREATE POLICY "Users can insert their own contact messages"
ON public.contact_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3) coupon_verifications: restrict SELECT to owner and admin
DROP POLICY IF EXISTS "verifications readable by all" ON public.coupon_verifications;
DROP POLICY IF EXISTS "Public can view coupon verifications" ON public.coupon_verifications;
DROP POLICY IF EXISTS "Anyone can view coupon verifications" ON public.coupon_verifications;
CREATE POLICY "Owner or admin can view coupon verifications"
ON public.coupon_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
