CREATE OR REPLACE FUNCTION public.grant_course_access(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.course_access_requests;
  v_course public.courses;
BEGIN
  SELECT * INTO v_req FROM public.course_access_requests WHERE id = p_request_id;
  IF v_req.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'REQUEST_NOT_FOUND');
  END IF;
  IF v_req.creator_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_OWNER');
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = v_req.course_id;

  INSERT INTO public.course_enrollments (course_id, user_id, amount_paid, platform_fee, creator_earning)
  VALUES (v_req.course_id, v_req.buyer_id, COALESCE(v_course.price, 0), 0, COALESCE(v_course.price, 0))
  ON CONFLICT DO NOTHING;

  UPDATE public.courses
  SET total_enrollments = COALESCE(total_enrollments, 0) + 1
  WHERE id = v_req.course_id;

  IF v_req.status <> 'granted' THEN
    UPDATE public.course_access_requests
    SET status = 'granted', granted_at = now()
    WHERE id = p_request_id;

    -- Chat message so the buyer sees the confirmation directly in the conversation
    INSERT INTO public.course_messages (course_id, sender_id, receiver_id, message)
    VALUES (
      v_req.course_id,
      v_req.creator_id,
      v_req.buyer_id,
      'Access granted to "' || COALESCE(v_course.title, 'the course') || '". Open My Learning in the Course Platform to start the lessons.'
    );

    INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
    VALUES (
      v_req.buyer_id,
      v_req.creator_id,
      'Access granted',
      'You now have access to "' || COALESCE(v_course.title, 'the course') || '". Open My Learning to start.',
      'course_access_granted',
      v_req.course_id,
      '/tutorial-platform?view=my-learning'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_course_access(UUID) TO authenticated;