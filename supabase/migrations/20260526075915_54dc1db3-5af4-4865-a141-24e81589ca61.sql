CREATE OR REPLACE FUNCTION public.notify_admins_verification_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN 
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      actor_id,
      related_id,
      is_read
    ) VALUES (
      admin_record.user_id,
      'verification_request',
      'New employer verification request',
      COALESCE(NEW.company_name, 'A company') || ' has submitted a verification request for review.',
      NEW.employer_id,
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;