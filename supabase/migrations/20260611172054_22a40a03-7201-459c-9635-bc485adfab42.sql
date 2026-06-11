
-- Add community_id to bazaar_items, ai_community_gallery and posts
ALTER TABLE public.bazaar_items ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL;
ALTER TABLE public.ai_community_gallery ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bazaar_items_community_id ON public.bazaar_items(community_id);
CREATE INDEX IF NOT EXISTS idx_ai_community_gallery_community_id ON public.ai_community_gallery(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);

-- Helper function: can current user view a community's content?
CREATE OR REPLACE FUNCTION public.can_view_community(_community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _community_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = _community_id
        AND (
          c.is_private = false
          OR c.creator_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.community_members m
            WHERE m.community_id = c.id AND m.user_id = auth.uid()
          )
        )
    );
$$;

-- Add policies that allow reading community-scoped items only if user can view community.
-- These ADD to existing policies (PostgREST evaluates OR across permissive policies).
DROP POLICY IF EXISTS "Community members can view community bazaar items" ON public.bazaar_items;
CREATE POLICY "Community members can view community bazaar items"
  ON public.bazaar_items FOR SELECT
  USING (community_id IS NOT NULL AND public.can_view_community(community_id));

DROP POLICY IF EXISTS "Community members can view community gallery" ON public.ai_community_gallery;
CREATE POLICY "Community members can view community gallery"
  ON public.ai_community_gallery FOR SELECT
  USING (community_id IS NOT NULL AND public.can_view_community(community_id));

DROP POLICY IF EXISTS "Community members can view community posts" ON public.posts;
CREATE POLICY "Community members can view community posts"
  ON public.posts FOR SELECT
  USING (community_id IS NOT NULL AND public.can_view_community(community_id));
