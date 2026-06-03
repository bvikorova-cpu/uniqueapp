
-- 1) Push notification delivery log (admin-only read)
CREATE TABLE IF NOT EXISTS public.push_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ids uuid[] NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed','no_subscriptions')),
  sent_count int NOT NULL DEFAULT 0,
  removed_count int NOT NULL DEFAULT 0,
  error text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.push_notification_logs TO authenticated;
GRANT ALL ON public.push_notification_logs TO service_role;

ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read push logs"
ON public.push_notification_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_push_logs_created_at ON public.push_notification_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_logs_status ON public.push_notification_logs (status);

-- 2) Per-user push preference (explicit on/off state)
CREATE TABLE IF NOT EXISTS public.user_push_settings (
  user_id uuid PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_push_settings TO authenticated;
GRANT ALL ON public.user_push_settings TO service_role;

ALTER TABLE public.user_push_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push settings"
ON public.user_push_settings FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3) gift_xp: send Web Push to recipient AND sender
CREATE OR REPLACE FUNCTION public.gift_xp(_recipient uuid, _amount integer, _message text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_balance int;
  v_today_total int;
  v_gift_id uuid;
  v_sender_name text;
  v_recipient_name text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  IF _recipient IS NULL OR _recipient = v_uid THEN RETURN jsonb_build_object('error','invalid_recipient'); END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 500 THEN RETURN jsonb_build_object('error','invalid_amount'); END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _recipient) THEN
    RETURN jsonb_build_object('error','recipient_not_found');
  END IF;
  SELECT COALESCE(sum(amount),0) INTO v_today_total FROM xp_gifts
    WHERE sender_id = v_uid AND created_at >= date_trunc('day', now());
  IF v_today_total + _amount > 500 THEN
    RETURN jsonb_build_object('error','daily_gift_limit_exceeded','remaining', GREATEST(0, 500 - v_today_total));
  END IF;
  SELECT total_points INTO v_balance FROM user_points WHERE user_id = v_uid;
  IF COALESCE(v_balance,0) < _amount THEN
    RETURN jsonb_build_object('error','insufficient_xp','balance',COALESCE(v_balance,0));
  END IF;
  PERFORM add_user_points(v_uid, -_amount, 'xp_gift_sent', _recipient::text);
  PERFORM add_user_points(_recipient, _amount, 'xp_gift_received', v_uid::text);
  INSERT INTO xp_gifts (sender_id, recipient_id, amount, message)
  VALUES (v_uid, _recipient, _amount, _message)
  RETURNING id INTO v_gift_id;

  SELECT COALESCE(display_name, username, 'Someone') INTO v_sender_name FROM profiles WHERE id = v_uid;
  SELECT COALESCE(display_name, username, 'A friend') INTO v_recipient_name FROM profiles WHERE id = _recipient;

  INSERT INTO notifications (user_id, actor_id, type, title, message, related_id, action_url)
  VALUES (_recipient, v_uid, 'xp_gift_received',
          'You received ' || _amount || ' XP! 🎁',
          COALESCE(_message, COALESCE(v_sender_name,'A friend') || ' sent you XP.'),
          v_gift_id,
          '/rewards?tab=gift-xp');

  -- Web Push to recipient
  PERFORM public.dispatch_push(
    ARRAY[_recipient]::uuid[],
    jsonb_build_object(
      'title', 'You received ' || _amount || ' XP! 🎁',
      'body',  COALESCE(_message, COALESCE(v_sender_name,'A friend') || ' sent you XP.'),
      'url',   '/rewards?tab=gift-xp',
      'type',  'xp_gift_received',
      'related_id', v_gift_id
    )
  );

  -- Web Push to sender (confirmation)
  PERFORM public.dispatch_push(
    ARRAY[v_uid]::uuid[],
    jsonb_build_object(
      'title', 'XP gift sent 🎁',
      'body',  'You sent ' || _amount || ' XP to ' || COALESCE(v_recipient_name,'a friend') || '.',
      'url',   '/rewards?tab=gift-xp',
      'type',  'xp_gift_sent',
      'related_id', v_gift_id
    )
  );

  RETURN jsonb_build_object('ok',true,'amount',_amount,'gift_id',v_gift_id);
END;
$function$;

-- 4) Friend quest invite response: also send Web Push to sender
CREATE OR REPLACE FUNCTION public._notify_friend_quest_invite_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_responder_name text;
  v_title text;
  v_body text;
  v_type text;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('accepted','rejected') THEN RETURN NEW; END IF;

  SELECT COALESCE(display_name, username, 'Your friend')
    INTO v_responder_name
  FROM public.profiles WHERE user_id = NEW.to_user;

  v_type  := CASE WHEN NEW.status = 'accepted' THEN 'friend_quest_accepted' ELSE 'friend_quest_rejected' END;
  v_title := CASE WHEN NEW.status = 'accepted' THEN 'Friend Quest accepted' ELSE 'Friend Quest declined' END;
  v_body  := COALESCE(v_responder_name, 'Your friend') ||
             CASE WHEN NEW.status = 'accepted' THEN ' accepted your quest invite' ELSE ' declined your quest invite' END;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url)
  VALUES (NEW.from_user, NEW.to_user, v_type, v_title, v_body, NEW.id, '/rewards?tab=friend-quests');

  PERFORM public.dispatch_push(
    ARRAY[NEW.from_user]::uuid[],
    jsonb_build_object(
      'title', v_title,
      'body',  v_body,
      'url',   '/rewards?tab=friend-quests',
      'type',  v_type,
      'related_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$;
