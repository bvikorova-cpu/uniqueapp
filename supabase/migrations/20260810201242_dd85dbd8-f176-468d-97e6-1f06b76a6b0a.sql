DROP POLICY IF EXISTS "Users manage their own collected hero cards" ON public.hero_collection_cards;

CREATE POLICY "Users can view their own collected hero cards"
ON public.hero_collection_cards FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own collected hero cards"
ON public.hero_collection_cards FOR DELETE TO authenticated
USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE ON public.hero_collection_cards FROM authenticated;