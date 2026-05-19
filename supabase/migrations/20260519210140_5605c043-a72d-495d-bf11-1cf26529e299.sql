-- Backfill notifications for any pending friend requests that predate the trigger
INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url, metadata)
SELECT
  f.friend_id,
  f.user_id,
  'friend_request',
  'New friend request',
  COALESCE(NULLIF(trim(p.full_name), ''), 'Someone') || ' sent you a friend request',
  f.id,
  '/friends?tab=requests',
  jsonb_build_object('friendship_id', f.id, 'requester_id', f.user_id)
FROM public.friendships f
LEFT JOIN public.profiles p ON p.id = f.user_id
WHERE f.status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.type = 'friend_request' AND n.related_id = f.id
  );