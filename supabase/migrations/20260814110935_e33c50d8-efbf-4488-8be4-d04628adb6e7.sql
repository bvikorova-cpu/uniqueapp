GRANT SELECT ON public.creator_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.creator_profiles TO authenticated;
GRANT ALL ON public.creator_profiles TO service_role;

GRANT SELECT ON public.creator_subscription_tiers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creator_subscription_tiers TO authenticated;
GRANT ALL ON public.creator_subscription_tiers TO service_role;

GRANT SELECT ON public.creator_message_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creator_message_settings TO authenticated;
GRANT ALL ON public.creator_message_settings TO service_role;

DROP POLICY IF EXISTS "Creators can manage their tiers" ON public.creator_subscription_tiers;
CREATE POLICY "Creators can manage their tiers"
  ON public.creator_subscription_tiers FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()))
  WITH CHECK (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Creators can manage their settings" ON public.creator_message_settings;
CREATE POLICY "Creators can manage their settings"
  ON public.creator_message_settings FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);