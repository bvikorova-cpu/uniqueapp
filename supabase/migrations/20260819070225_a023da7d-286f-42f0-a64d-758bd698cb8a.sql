-- Course access requests (off-platform payment flow)
CREATE TABLE IF NOT EXISTS public.course_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','granted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_at TIMESTAMPTZ,
  UNIQUE (course_id, buyer_id)
);

GRANT SELECT, INSERT, UPDATE ON public.course_access_requests TO authenticated;
GRANT ALL ON public.course_access_requests TO service_role;
ALTER TABLE public.course_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view course access requests"
ON public.course_access_requests FOR SELECT TO authenticated
USING (buyer_id = auth.uid() OR creator_id = auth.uid());

CREATE POLICY "Buyers can create access requests"
ON public.course_access_requests FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Creators can update access requests"
ON public.course_access_requests FOR UPDATE TO authenticated
USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

-- Direct messages between buyer and course creator
CREATE TABLE IF NOT EXISTS public.course_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  attachment_path TEXT,
  attachment_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.course_messages TO authenticated;
GRANT ALL ON public.course_messages TO service_role;
ALTER TABLE public.course_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view course messages"
ON public.course_messages FOR SELECT TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send course messages"
ON public.course_messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Receivers can mark course messages read"
ON public.course_messages FOR UPDATE TO authenticated
USING (receiver_id = auth.uid()) WITH CHECK (receiver_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_course_messages_course ON public.course_messages(course_id, created_at);
CREATE INDEX IF NOT EXISTS idx_course_messages_receiver ON public.course_messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_course_access_requests_creator ON public.course_access_requests(creator_id, status);

-- Notify creator/buyer on new message
CREATE OR REPLACE FUNCTION public.notify_course_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
BEGIN
  SELECT title INTO v_title FROM public.courses WHERE id = NEW.course_id;
  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (
    NEW.receiver_id,
    NEW.sender_id,
    'New course message',
    COALESCE(v_title, 'Course') || ': ' || left(NEW.message, 90),
    'course_message',
    NEW.course_id,
    '/tutorial-platform?view=messages'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_course_message ON public.course_messages;
CREATE TRIGGER trg_notify_course_message
AFTER INSERT ON public.course_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_course_message();

-- Creator grants access -> enrollment created
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

  UPDATE public.course_access_requests
  SET status = 'granted', granted_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (
    v_req.buyer_id,
    v_req.creator_id,
    'Access granted',
    'You now have access to "' || COALESCE(v_course.title, 'the course') || '". Happy learning!',
    'course_access_granted',
    v_req.course_id,
    '/tutorial-course/' || v_req.course_id::text
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_course_access(UUID) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.course_messages;