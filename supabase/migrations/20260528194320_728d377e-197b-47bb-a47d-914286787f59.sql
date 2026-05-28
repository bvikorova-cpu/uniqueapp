CREATE OR REPLACE FUNCTION public.notify_admins_on_brand_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_rec RECORD;
  brand_name TEXT;
BEGIN
  -- Only notify when a brand enters/started pending moderation
  IF NEW.moderation_status IS DISTINCT FROM 'pending' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.moderation_status = 'pending' THEN
    RETURN NEW;
  END IF;

  brand_name := COALESCE(NEW.brand_name, NEW.name, 'New brand');

  FOR admin_rec IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read)
    VALUES (
      admin_rec.user_id,
      'brand_moderation_pending',
      'New brand awaiting approval',
      brand_name || ' submitted a sponsorship request and is waiting for moderation.',
      '/admin/brand-moderation',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_on_brand_submission_ins ON public.brand_sponsors;
DROP TRIGGER IF EXISTS trg_notify_admins_on_brand_submission_upd ON public.brand_sponsors;

CREATE TRIGGER trg_notify_admins_on_brand_submission_ins
AFTER INSERT ON public.brand_sponsors
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_brand_submission();

CREATE TRIGGER trg_notify_admins_on_brand_submission_upd
AFTER UPDATE OF moderation_status ON public.brand_sponsors
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_brand_submission();
