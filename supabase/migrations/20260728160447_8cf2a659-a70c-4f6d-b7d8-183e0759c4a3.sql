
CREATE OR REPLACE FUNCTION public.notify_conversation_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; who text;
BEGIN
  who := public.actor_name(NEW.sender_id);
  FOR r IN SELECT user_id FROM public.conversation_participants
           WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id
             AND (muted_until IS NULL OR muted_until < now()) LOOP
    PERFORM public.push_notification(r.user_id, NEW.sender_id, 'message', 'New message',
      who || ' sent you a message', '/wall/messages', NEW.conversation_id);
  END LOOP;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_group_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; who text; gname text;
BEGIN
  who := public.actor_name(NEW.sender_id);
  SELECT name INTO gname FROM public.groups WHERE id = NEW.group_id;
  FOR r IN SELECT user_id FROM public.group_members WHERE group_id = NEW.group_id AND user_id <> NEW.sender_id LOOP
    PERFORM public.push_notification(r.user_id, NEW.sender_id, 'group_message', COALESCE(gname,'Group') || ' — new message',
      who || ' wrote in the group', '/wall/groups/' || NEW.group_id, NEW.group_id);
  END LOOP;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_dating_match() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.user1_id, NEW.user2_id, 'dating_match', 'It''s a match!', 'You have a new match in Dating', '/dating', NEW.id);
  PERFORM public.push_notification(NEW.user2_id, NEW.user1_id, 'dating_match', 'It''s a match!', 'You have a new match in Dating', '/dating', NEW.id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_dating_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE other uuid;
BEGIN
  SELECT CASE WHEN user1_id = NEW.sender_id THEN user2_id ELSE user1_id END INTO other
  FROM public.dating_matches WHERE id = NEW.match_id;
  PERFORM public.push_notification(other, NEW.sender_id, 'dating_message', 'New dating message',
    'You received a new message', '/dating', NEW.match_id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_dating_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'dating_super_likes' THEN
    PERFORM public.push_notification(NEW.swiped_id, NEW.swiper_id, 'dating_super_like', 'Super Like!', 'Someone super liked you', '/dating', NEW.id);
  ELSE
    PERFORM public.push_notification(NEW.liked_id, NEW.liker_id, 'dating_like', 'Someone likes you', 'You have a new like in Dating', '/dating', NEW.id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_forum_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM public.forum_posts WHERE id = NEW.post_id;
  PERFORM public.push_notification(owner_id, NEW.user_id, 'forum_comment', 'New forum reply',
    public.actor_name(NEW.user_id) || ' replied to your topic', '/megaforum', NEW.post_id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_forum_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'forum_post_likes' THEN
    SELECT user_id INTO owner_id FROM public.forum_posts WHERE id = NEW.post_id;
    PERFORM public.push_notification(owner_id, NEW.user_id, 'forum_like', 'New like',
      public.actor_name(NEW.user_id) || ' liked your topic', '/megaforum', NEW.post_id);
  ELSE
    SELECT user_id INTO owner_id FROM public.forum_comments WHERE id = NEW.comment_id;
    PERFORM public.push_notification(owner_id, NEW.user_id, 'forum_like', 'New like',
      public.actor_name(NEW.user_id) || ' liked your reply', '/megaforum', NEW.comment_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_bazaar_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'bazaar_message', 'New Bazaar message',
    public.actor_name(NEW.sender_id) || ' sent you a message about a listing', '/bazaar', NEW.item_id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_bazaar_order() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.seller_id, NEW.buyer_id, 'bazaar_order', 'New order',
    public.actor_name(NEW.buyer_id) || ' ordered your item', '/bazaar', NEW.id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_creator_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'creator_message', 'New message',
    public.actor_name(NEW.sender_id) || ' sent you a message', '/influ-king', NEW.id);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_creator_gift() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.recipient_creator_id, NEW.sender_id, 'creator_gift', 'You received a gift',
    public.actor_name(NEW.sender_id) || ' sent you a gift', '/influencer/earnings', NEW.id);
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.push_notification(uuid,uuid,text,text,text,text,uuid,uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.actor_name(uuid) FROM anon, public;
