
-- 1. Create security definer function to check group membership (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_chat_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
  );
$$;

-- 2. Create security definer function to check group admin/creator role
CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_chat_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role = ANY (ARRAY['admin'::text, 'creator'::text])
  );
$$;

-- 3. Create function to check if user is group creator
CREATE OR REPLACE FUNCTION public.is_group_creator(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_chats
    WHERE id = p_group_id
      AND created_by = p_user_id
  );
$$;

-- 4. Drop broken policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_chat_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_chat_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_chat_members;

-- 5. Recreate fixed policies using security definer functions
CREATE POLICY "Users can view members of their groups"
ON public.group_chat_members
FOR SELECT
USING (
  public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Group admins can add members"
ON public.group_chat_members
FOR INSERT
WITH CHECK (
  public.is_group_admin(group_id, auth.uid())
  OR public.is_group_creator(group_id, auth.uid())
);

CREATE POLICY "Users can leave groups"
ON public.group_chat_members
FOR DELETE
USING (auth.uid() = user_id);
