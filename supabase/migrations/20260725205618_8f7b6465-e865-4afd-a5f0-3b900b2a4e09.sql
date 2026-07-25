GRANT SELECT ON public.mystery_boxes TO anon, authenticated;
GRANT ALL ON public.mystery_boxes TO service_role;

GRANT SELECT ON public.mystery_box_items TO anon, authenticated;
GRANT ALL ON public.mystery_box_items TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.user_mystery_boxes TO authenticated;
GRANT ALL ON public.user_mystery_boxes TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.mystery_box_rewards TO authenticated;
GRANT ALL ON public.mystery_box_rewards TO service_role;