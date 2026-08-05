CREATE OR REPLACE FUNCTION public.deliver_due_time_capsules()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  r record;
BEGIN
  FOR r IN
    UPDATE public.time_capsules
       SET is_delivered = true, updated_at = now()
     WHERE COALESCE(is_delivered, false) = false
       AND delivery_date <= now()
    RETURNING id, user_id, title
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url)
    VALUES (
      r.user_id,
      'Time Capsule unlocked',
      'Your time capsule "' || COALESCE(r.title, 'Untitled') || '" is ready to open.',
      'time_capsule',
      r.id,
      '/time-capsule'
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.deliver_due_time_capsules() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.deliver_due_time_capsules() TO service_role;

SELECT cron.schedule(
  'deliver-time-capsules',
  '*/10 * * * *',
  $$SELECT public.deliver_due_time_capsules();$$
);

SELECT public.deliver_due_time_capsules();