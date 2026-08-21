CREATE OR REPLACE FUNCTION public.track_job_view(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF p_job_id IS NULL THEN RETURN; END IF;

  -- Do not count the employer's own visits
  IF EXISTS (SELECT 1 FROM public.job_listings WHERE id = p_job_id AND employer_id = v_user) THEN
    RETURN;
  END IF;

  IF v_user IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.job_analytics_events
      WHERE job_id = p_job_id AND user_id = v_user AND event_type = 'view'
        AND created_at > now() - interval '1 hour'
    ) THEN
      RETURN;
    END IF;
    INSERT INTO public.job_analytics_events (job_id, user_id, event_type)
    VALUES (p_job_id, v_user, 'view');
  END IF;

  UPDATE public.job_listings
     SET views_count = COALESCE(views_count, 0) + 1
   WHERE id = p_job_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_job_view(uuid) TO anon, authenticated;