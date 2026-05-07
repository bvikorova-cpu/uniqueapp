
-- Allow owners to insert their own influencer earnings (client-side publish flow)
CREATE POLICY "Owners can insert their influencer earnings"
ON public.influencer_earnings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.virtual_influencers va
    WHERE va.id = influencer_earnings.influencer_id
      AND va.user_id = auth.uid()
  )
);

-- Allow owners to insert their own influencer balance row
CREATE POLICY "Owners can insert their influencer balance"
ON public.influencer_balances
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.virtual_influencers va
    WHERE va.id = influencer_balances.influencer_id
      AND va.user_id = auth.uid()
  )
);

-- Allow owners to update their own influencer balance row
CREATE POLICY "Owners can update their influencer balance"
ON public.influencer_balances
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.virtual_influencers va
    WHERE va.id = influencer_balances.influencer_id
      AND va.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.virtual_influencers va
    WHERE va.id = influencer_balances.influencer_id
      AND va.user_id = auth.uid()
  )
);
