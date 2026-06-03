-- Fix friend quest notification triggers: profiles uses id + full_name, not user_id + display_name.
-- Also add dispatch_push to the INSERT trigger (recipient) for consistency.

CREATE OR REPLACE FUNCTION public._notify_friend_quest_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sender_name text;
  v_quest_title text;
  v_body text;
BEGIN
  SELECT COALESCE(full_name, username, 'A friend')
    INTO v_sender_name
  FROM public.profiles WHERE id = NEW.from_user;

  v_quest_title := CASE NEW.quest_type
    WHEN 'post_streak' THEN 'Post 14 days in a row'
    WHEN 'ai_combo'    THEN 'Use 30 AI tools together'
    WHEN 'xp_marathon' THEN 'Earn 5,000 XP combined'
    ELSE NEW.quest_type
  END;

  v_body := COALESCE(v_sender_name, 'A friend') || ' invited you: ' || v_quest_title;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url)
  VALUES (NEW.to_user, NEW.from_user, 'friend_quest_invite', 'Friend Quest invite', v_body, NEW.id, '/rewards?tab=friend-quests');

  PERFORM public.dispatch_push(
    ARRAY[NEW.to_user]::uuid[],
    jsonb_build_object(
      'title', 'Friend Quest invite',
      'body',  v_body,
      'url',   '/rewards?tab=friend-quests',
      'type',  'friend_quest_invite',
      'related_id', NEW.id
    )
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public._notify_friend_quest_invite_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_responder_name text;
  v_title text;
  v_body text;
  v_type text;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('accepted','rejected') THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, username, 'Your friend')
    INTO v_responder_name
  FROM public.profiles WHERE id = NEW.to_user;

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
$function$;