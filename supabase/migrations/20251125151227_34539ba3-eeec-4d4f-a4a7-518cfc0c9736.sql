-- Fix existing groups: add creators as admin members
INSERT INTO group_members (group_id, user_id, role)
SELECT g.id, g.creator_id, 'admin'
FROM groups g
WHERE NOT EXISTS (
  SELECT 1 FROM group_members gm 
  WHERE gm.group_id = g.id AND gm.user_id = g.creator_id
)
ON CONFLICT DO NOTHING;