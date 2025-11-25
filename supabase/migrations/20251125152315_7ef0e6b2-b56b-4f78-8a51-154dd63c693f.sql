-- Add policy to allow creators to see their own groups
CREATE POLICY "Creators can view their groups"
ON groups FOR SELECT
USING (auth.uid() = creator_id);