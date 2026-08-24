CREATE OR REPLACE FUNCTION public.handle_new_user_welcome_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (SELECT 1 FROM public.ai_credits WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;
  PERFORM public.add_ai_credits(NEW.id, 5, 'welcome_bonus', 'signup');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_welcome_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_welcome_credits
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_welcome_credits();