CREATE POLICY "Owners can view their own bazaar items"
ON public.bazaar_items FOR SELECT TO authenticated
USING (auth.uid() = user_id);