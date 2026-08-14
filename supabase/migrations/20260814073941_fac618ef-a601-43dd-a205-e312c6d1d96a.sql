CREATE OR REPLACE FUNCTION public.notify_admins_payout_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_user uuid;
  v_name text;
  v_title text;
  v_url text;
BEGIN
  IF TG_TABLE_NAME = 'comedian_withdrawal_requests' THEN
    v_user := NEW.comedian_id;
    v_title := 'New comedian payout request';
    v_url := '/admin/comedy-payouts';
  ELSE
    v_user := NEW.musician_id;
    v_title := 'New artist payout request';
    v_url := '/admin/concert-earnings';
  END IF;

  SELECT COALESCE(display_name, username, 'User') INTO v_name
  FROM public.profiles WHERE id = v_user;

  INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url, metadata)
  SELECT ur.user_id,
         v_title,
         COALESCE(v_name, 'User') || ' requested a payout of €' || to_char(NEW.amount, 'FM999999990.00') || '.',
         'admin_withdrawal',
         NEW.id,
         v_url,
         jsonb_build_object('source', TG_TABLE_NAME, 'amount', NEW.amount, 'requester_id', v_user)
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_comedian_payout ON public.comedian_withdrawal_requests;
CREATE TRIGGER trg_notify_admins_comedian_payout
AFTER INSERT ON public.comedian_withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_payout_request();

DROP TRIGGER IF EXISTS trg_notify_admins_musician_payout ON public.musician_withdrawal_requests;
CREATE TRIGGER trg_notify_admins_musician_payout
AFTER INSERT ON public.musician_withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_payout_request();