CREATE POLICY "Service manages lounge identities" ON public.support_lounge_identities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages lounge messages v2" ON public.support_lounge_messages_v2 FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages lounge dms v2" ON public.support_lounge_dms_v2 FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages lounge attendance" ON public.support_lounge_attendance FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages lounge contacts" ON public.support_lounge_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages legacy lounge nicknames" ON public.support_lounge_nicknames FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages lounge passes" ON public.support_lounge_passes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages legacy lounge messages" ON public.support_lounge_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages legacy lounge dms" ON public.support_lounge_dms FOR ALL TO service_role USING (true) WITH CHECK (true);