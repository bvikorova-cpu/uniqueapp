
-- 1) family_relationships: zúžiť SELECT len na vlastné väzby
DROP POLICY IF EXISTS "View confirmed family or own pending" ON public.family_relationships;

CREATE POLICY "Users view only their own family ties"
  ON public.family_relationships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = related_user_id);

-- 2) dating_super_likes: odstrániť duplicitné politiky, ponechať 1 SELECT + 1 INSERT
DROP POLICY IF EXISTS "Users can view their own super likes" ON public.dating_super_likes;
DROP POLICY IF EXISTS "Users can insert super likes" ON public.dating_super_likes;

-- 3) dating_swipes: odstrániť duplicitné politiky
DROP POLICY IF EXISTS "Users can view their own swipes" ON public.dating_swipes;
DROP POLICY IF EXISTS "Users can insert swipes" ON public.dating_swipes;

-- 4) dating_likes_you: odstrániť duplicitnú INSERT
DROP POLICY IF EXISTS "Users can insert likes" ON public.dating_likes_you;
