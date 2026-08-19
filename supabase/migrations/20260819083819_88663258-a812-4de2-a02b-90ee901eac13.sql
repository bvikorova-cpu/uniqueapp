CREATE OR REPLACE FUNCTION public.request_course_access(p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_creator uuid;
  v_title text;
  v_existing public.course_access_requests;
  v_before integer;
  v_after integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT c.instructor_id, c.title INTO v_creator, v_title FROM public.courses c WHERE c.id = p_course_id;
  IF v_creator IS NULL THEN
    RAISE EXCEPTION 'COURSE_NOT_FOUND';
  END IF;
  IF v_creator = v_user THEN
    RETURN jsonb_build_object('success', true, 'charged', 0, 'own_course', true);
  END IF;

  SELECT * INTO v_existing FROM public.course_access_requests
  WHERE course_id = p_course_id AND buyer_id = v_user
  ORDER BY created_at DESC LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'charged', 0, 'request_id', v_existing.id, 'status', v_existing.status);
  END IF;

  IF EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = p_course_id AND user_id = v_user) THEN
    RETURN jsonb_build_object('success', true, 'charged', 0, 'enrolled', true);
  END IF;

  SELECT credits_remaining INTO v_before FROM public.ai_credits WHERE user_id = v_user;
  v_after := public.deduct_ai_credits_atomic(v_user, 3);

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_user, -3, COALESCE(v_before, v_after + 3), v_after,
          'course_access_request', 'tutorial_platform', v_user,
          jsonb_build_object('course_id', p_course_id, 'creator_id', v_creator));

  INSERT INTO public.course_access_requests (course_id, buyer_id, creator_id, status)
  VALUES (p_course_id, v_user, v_creator, 'pending')
  RETURNING * INTO v_existing;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (v_creator, v_user, 'New course access request',
          'Someone requested access to "' || COALESCE(v_title, 'your course') || '".',
          'course_access_request', p_course_id, '/tutorial-course/' || p_course_id::text);

  RETURN jsonb_build_object('success', true, 'charged', 3, 'balance', v_after, 'request_id', v_existing.id, 'status', 'pending');
END;
$function$;

GRANT EXECUTE ON FUNCTION public.request_course_access(uuid) TO authenticated;