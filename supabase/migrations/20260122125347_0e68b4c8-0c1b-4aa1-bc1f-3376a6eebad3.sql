-- Drop restrictive policy and create public read access for battles
DROP POLICY IF EXISTS "Subscribers can view battles" ON public.shadow_battles;

-- Anyone can view battles (they're public competitions)
CREATE POLICY "Anyone can view battles"
  ON public.shadow_battles
  FOR SELECT
  USING (true);

-- Authenticated users can create battles (for admin/testing)
CREATE POLICY "Authenticated users can create battles"
  ON public.shadow_battles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');