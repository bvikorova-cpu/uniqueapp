INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata, created_at)
SELECT
  '69e6cf11-bc89-4ee6-84fb-89a825cca9d2'::uuid,
  'gift_credits',
  '🎁 You received 10 AI credits!',
  'A friend sent you 10 credits — "Nanana"',
  '/ai-credits',
  jsonb_build_object('amount', 10, 'message', 'Nanana', 'backfilled', true),
  '2026-07-25 20:35:21.105744+00'::timestamptz
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications
  WHERE user_id = '69e6cf11-bc89-4ee6-84fb-89a825cca9d2'
    AND type = 'gift_credits'
    AND created_at::date = '2026-07-25'
);