DROP POLICY IF EXISTS "Users can view their own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can insert their own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can update their own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can delete their own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Anyone can view interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can manage their interests" ON public.user_interests;

CREATE POLICY "Users can view their own interests" ON public.user_interests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interests" ON public.user_interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interests" ON public.user_interests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interests" ON public.user_interests FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view codes for validation" ON public.megatalent_referral_codes;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.coffee_profiles;
DROP POLICY IF EXISTS "Authenticated users can view coffee profiles" ON public.coffee_profiles;
CREATE POLICY "Authenticated users can view coffee profiles" ON public.coffee_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;