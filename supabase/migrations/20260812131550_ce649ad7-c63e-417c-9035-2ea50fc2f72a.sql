DELETE FROM public.shadow_stories s
USING public.shadow_stories t
WHERE s.user_id = t.user_id
  AND s.title = t.title
  AND s.created_at < t.created_at;