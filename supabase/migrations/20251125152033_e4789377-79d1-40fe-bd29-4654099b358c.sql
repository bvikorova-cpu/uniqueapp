-- Drop existing policies
DROP POLICY IF EXISTS "Create groups policy" ON groups;
DROP POLICY IF EXISTS "Group admins update groups" ON groups;
DROP POLICY IF EXISTS "View public or member groups" ON groups;

-- Create proper RLS policies for groups
CREATE POLICY "Anyone can view public groups"
ON groups FOR SELECT
USING (is_private = false);

CREATE POLICY "Members can view their groups"
ON groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins can update their groups"
ON groups FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
  )
);

CREATE POLICY "Admins can delete their groups"
ON groups FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
  )
);