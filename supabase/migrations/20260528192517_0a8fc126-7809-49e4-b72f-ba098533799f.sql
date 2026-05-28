
CREATE OR REPLACE FUNCTION public.notify_admins_on_brand_appeal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  brand_name TEXT;
BEGIN
  SELECT name INTO brand_name FROM public.brand_sponsors WHERE id = NEW.brand_id;

  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, action_url, related_id, metadata)
    VALUES (
      admin_record.user_id,
      'brand_appeal_submitted',
      'New brand appeal submitted',
      COALESCE(brand_name, 'A brand') || ' has submitted an appeal for review.',
      '/admin/brand-moderation',
      NEW.id,
      jsonb_build_object('appeal_id', NEW.id, 'brand_id', NEW.brand_id, 'brand_name', brand_name)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_brand_appeal ON public.brand_moderation_appeals;
CREATE TRIGGER trg_notify_admins_brand_appeal
  AFTER INSERT ON public.brand_moderation_appeals
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_brand_appeal();
