CREATE POLICY "Users can create their own referral code"
ON public.megatalent_referral_codes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);