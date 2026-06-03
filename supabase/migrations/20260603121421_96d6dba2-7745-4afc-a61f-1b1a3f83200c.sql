
-- Friend quest invite notifications (recipient + acceptance back to sender)
CREATE OR REPLACE FUNCTION public._notify_friend_quest_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name text;
  v_quest_title text;
BEGIN
  SELECT COALESCE(display_name, username, 'A friend')
    INTO v_sender_name
  FROM public.profiles WHERE user_id = NEW.from_user;

  v_quest_title := CASE NEW.quest_type
    WHEN 'post_streak' THEN 'Post 14 days in a row'
    WHEN 'ai_combo'    THEN 'Use 30 AI tools together'
    WHEN 'xp_marathon' THEN 'Earn 5,000 XP combined'
    ELSE NEW.quest_type
  END;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url)
  VALUES (
    NEW.to_user,
    NEW.from_user,
    'friend_quest_invite',
    'Friend Quest invite',
    COALESCE(v_sender_name, 'A friend') || ' invited you: ' || v_quest_title,
    NEW.id,
    '/rewards?tab=friend-quests'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_friend_quest_invite ON public.friend_quest_invites;
CREATE TRIGGER trg_notify_friend_quest_invite
AFTER INSERT ON public.friend_quest_invites
FOR EACH ROW EXECUTE FUNCTION public._notify_friend_quest_invite();

CREATE OR REPLACE FUNCTION public._notify_friend_quest_invite_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_responder_name text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;
  IF NEW.status NOT IN ('accepted','rejected') THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(display_name, username, 'Your friend')
    INTO v_responder_name
  FROM public.profiles WHERE user_id = NEW.to_user;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url)
  VALUES (
    NEW.from_user,
    NEW.to_user,
    CASE WHEN NEW.status = 'accepted' THEN 'friend_quest_accepted' ELSE 'friend_quest_rejected' END,
    CASE WHEN NEW.status = 'accepted' THEN 'Friend Quest accepted' ELSE 'Friend Quest declined' END,
    COALESCE(v_responder_name, 'Your friend') ||
      CASE WHEN NEW.status = 'accepted' THEN ' accepted your quest invite' ELSE ' declined your quest invite' END,
    NEW.id,
    '/rewards?tab=friend-quests'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_friend_quest_invite_response ON public.friend_quest_invites;
CREATE TRIGGER trg_notify_friend_quest_invite_response
AFTER UPDATE OF status ON public.friend_quest_invites
FOR EACH ROW EXECUTE FUNCTION public._notify_friend_quest_invite_response();
