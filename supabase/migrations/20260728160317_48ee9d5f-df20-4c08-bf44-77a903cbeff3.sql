
-- Generic helper
CREATE OR REPLACE FUNCTION public.push_notification(
  _user_id uuid, _actor_id uuid, _type text, _title text, _message text,
  _action_url text DEFAULT NULL, _related_id uuid DEFAULT NULL, _post_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL OR _user_id = _actor_id THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id, post_id)
  VALUES (_user_id, _actor_id, _type, _title, _message, _action_url, _related_id, _post_id);
END; $$;

CREATE OR REPLACE FUNCTION public.actor_name(_user_id uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(NULLIF(p.full_name,''), NULLIF(p.username,''), 'Someone') FROM public.profiles p WHERE p.id = _user_id
$$;

-- 1) Post comments: owner, parent comment author, tagged friends
CREATE OR REPLACE FUNCTION public.notify_post_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid; parent_author uuid; who text; tagged uuid;
BEGIN
  who := public.actor_name(NEW.user_id);
  SELECT user_id INTO owner_id FROM public.posts WHERE id = NEW.post_id;
  PERFORM public.push_notification(owner_id, NEW.user_id, 'comment', 'New comment',
    who || ' commented on your post', '/post/' || NEW.post_id, NEW.id, NEW.post_id);
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO parent_author FROM public.post_comments WHERE id = NEW.parent_comment_id;
    IF parent_author IS DISTINCT FROM owner_id THEN
      PERFORM public.push_notification(parent_author, NEW.user_id, 'comment_reply', 'New reply',
        who || ' replied to your comment', '/post/' || NEW.post_id, NEW.id, NEW.post_id);
    END IF;
  END IF;
  IF NEW.tagged_friends IS NOT NULL THEN
    FOREACH tagged IN ARRAY NEW.tagged_friends LOOP
      PERFORM public.push_notification(tagged, NEW.user_id, 'mention', 'You were tagged',
        who || ' tagged you in a comment', '/post/' || NEW.post_id, NEW.id, NEW.post_id);
    END LOOP;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_post_comment ON public.post_comments;
CREATE TRIGGER trg_notify_post_comment AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_post_comment();

-- 2) Comment reactions
CREATE OR REPLACE FUNCTION public.notify_comment_reaction() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE author uuid; pid uuid;
BEGIN
  SELECT user_id, post_id INTO author, pid FROM public.post_comments WHERE id = NEW.comment_id;
  PERFORM public.push_notification(author, NEW.user_id, 'comment_reaction', 'New reaction',
    public.actor_name(NEW.user_id) || ' reacted to your comment',
    CASE WHEN pid IS NOT NULL THEN '/post/' || pid ELSE '/notifications' END, NEW.comment_id, pid);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_comment_reaction ON public.comment_reactions;
CREATE TRIGGER trg_notify_comment_reaction AFTER INSERT ON public.comment_reactions
FOR EACH ROW EXECUTE FUNCTION public.notify_comment_reaction();

-- 3) Direct messages (messages + conversation_messages)
CREATE OR REPLACE FUNCTION public.notify_conversation_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; who text;
BEGIN
  who := public.actor_name(NEW.sender_id);
  FOR r IN SELECT user_id FROM public.conversation_participants
           WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id
             AND (muted_until IS NULL OR muted_until < now()) LOOP
    PERFORM public.push_notification(r.user_id, NEW.sender_id, 'message', 'New message',
      who || ' sent you a message', '/messages?c=' || NEW.conversation_id, NEW.conversation_id);
  END LOOP;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_messages ON public.messages;
CREATE TRIGGER trg_notify_messages AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_conversation_message();
DROP TRIGGER IF EXISTS trg_notify_conversation_messages ON public.conversation_messages;
CREATE TRIGGER trg_notify_conversation_messages AFTER INSERT ON public.conversation_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_conversation_message();

-- 4) Group messages
CREATE OR REPLACE FUNCTION public.notify_group_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; who text; gname text;
BEGIN
  who := public.actor_name(NEW.sender_id);
  SELECT name INTO gname FROM public.groups WHERE id = NEW.group_id;
  FOR r IN SELECT user_id FROM public.group_members WHERE group_id = NEW.group_id AND user_id <> NEW.sender_id LOOP
    PERFORM public.push_notification(r.user_id, NEW.sender_id, 'group_message', COALESCE(gname,'Group') || ' — new message',
      who || ' wrote in the group', '/groups/' || NEW.group_id, NEW.group_id);
  END LOOP;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_group_message ON public.group_messages;
CREATE TRIGGER trg_notify_group_message AFTER INSERT ON public.group_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_group_message();

-- 5) Dating
CREATE OR REPLACE FUNCTION public.notify_dating_match() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.user1_id, NEW.user2_id, 'dating_match', 'It''s a match!',
    'You have a new match in Dating', '/dating/matches', NEW.id);
  PERFORM public.push_notification(NEW.user2_id, NEW.user1_id, 'dating_match', 'It''s a match!',
    'You have a new match in Dating', '/dating/matches', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_dating_match ON public.dating_matches;
CREATE TRIGGER trg_notify_dating_match AFTER INSERT ON public.dating_matches
FOR EACH ROW EXECUTE FUNCTION public.notify_dating_match();

CREATE OR REPLACE FUNCTION public.notify_dating_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE other uuid;
BEGIN
  SELECT CASE WHEN user1_id = NEW.sender_id THEN user2_id ELSE user1_id END INTO other
  FROM public.dating_matches WHERE id = NEW.match_id;
  PERFORM public.push_notification(other, NEW.sender_id, 'dating_message', 'New dating message',
    'You received a new message', '/dating/chat/' || NEW.match_id, NEW.match_id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_dating_message ON public.dating_messages;
CREATE TRIGGER trg_notify_dating_message AFTER INSERT ON public.dating_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_dating_message();

CREATE OR REPLACE FUNCTION public.notify_dating_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'dating_super_likes' THEN
    PERFORM public.push_notification(NEW.swiped_id, NEW.swiper_id, 'dating_super_like', 'Super Like!',
      'Someone super liked you', '/dating', NEW.id);
  ELSE
    PERFORM public.push_notification(NEW.liked_id, NEW.liker_id, 'dating_like', 'Someone likes you',
      'You have a new like in Dating', '/dating/likes', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_dating_super_like ON public.dating_super_likes;
CREATE TRIGGER trg_notify_dating_super_like AFTER INSERT ON public.dating_super_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_dating_like();
DROP TRIGGER IF EXISTS trg_notify_dating_likes_you ON public.dating_likes_you;
CREATE TRIGGER trg_notify_dating_likes_you AFTER INSERT ON public.dating_likes_you
FOR EACH ROW EXECUTE FUNCTION public.notify_dating_like();

-- 6) Forum
CREATE OR REPLACE FUNCTION public.notify_forum_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM public.forum_posts WHERE id = NEW.post_id;
  PERFORM public.push_notification(owner_id, NEW.user_id, 'forum_comment', 'New forum reply',
    public.actor_name(NEW.user_id) || ' replied to your topic', '/forum/post/' || NEW.post_id, NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_forum_comment ON public.forum_comments;
CREATE TRIGGER trg_notify_forum_comment AFTER INSERT ON public.forum_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_forum_comment();

CREATE OR REPLACE FUNCTION public.notify_forum_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid; pid uuid;
BEGIN
  IF TG_TABLE_NAME = 'forum_post_likes' THEN
    SELECT user_id INTO owner_id FROM public.forum_posts WHERE id = NEW.post_id;
    PERFORM public.push_notification(owner_id, NEW.user_id, 'forum_like', 'New like',
      public.actor_name(NEW.user_id) || ' liked your topic', '/forum/post/' || NEW.post_id, NEW.id);
  ELSE
    SELECT user_id, post_id INTO owner_id, pid FROM public.forum_comments WHERE id = NEW.comment_id;
    PERFORM public.push_notification(owner_id, NEW.user_id, 'forum_like', 'New like',
      public.actor_name(NEW.user_id) || ' liked your reply',
      CASE WHEN pid IS NOT NULL THEN '/forum/post/' || pid ELSE '/forum' END, NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_forum_post_like ON public.forum_post_likes;
CREATE TRIGGER trg_notify_forum_post_like AFTER INSERT ON public.forum_post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_forum_like();
DROP TRIGGER IF EXISTS trg_notify_forum_comment_like ON public.forum_comment_likes;
CREATE TRIGGER trg_notify_forum_comment_like AFTER INSERT ON public.forum_comment_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_forum_like();

-- 7) Bazaar
CREATE OR REPLACE FUNCTION public.notify_bazaar_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'bazaar_message', 'New Bazaar message',
    public.actor_name(NEW.sender_id) || ' sent you a message about a listing',
    '/bazaar/item/' || NEW.item_id, NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_bazaar_message ON public.bazaar_messages;
CREATE TRIGGER trg_notify_bazaar_message AFTER INSERT ON public.bazaar_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_bazaar_message();

CREATE OR REPLACE FUNCTION public.notify_bazaar_order() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.seller_id, NEW.buyer_id, 'bazaar_order', 'New order',
    public.actor_name(NEW.buyer_id) || ' ordered your item', '/bazaar/orders', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_bazaar_order ON public.bazaar_orders;
CREATE TRIGGER trg_notify_bazaar_order AFTER INSERT ON public.bazaar_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_bazaar_order();

-- 8) Creators
CREATE OR REPLACE FUNCTION public.notify_creator_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'creator_message', 'New message',
    public.actor_name(NEW.sender_id) || ' sent you a message', '/influking/messages', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_creator_message ON public.creator_messages;
CREATE TRIGGER trg_notify_creator_message AFTER INSERT ON public.creator_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_message();

CREATE OR REPLACE FUNCTION public.notify_creator_gift() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.recipient_creator_id, NEW.sender_id, 'creator_gift', 'You received a gift',
    public.actor_name(NEW.sender_id) || ' sent you a gift', '/influking/earnings', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_creator_gift ON public.creator_gifts_sent;
CREATE TRIGGER trg_notify_creator_gift AFTER INSERT ON public.creator_gifts_sent
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_gift();

-- 9) Coffee
CREATE OR REPLACE FUNCTION public.notify_coffee_match() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.push_notification(NEW.user1_id, NEW.user2_id, 'coffee_match', 'New coffee match',
    'You have a new coffee match', '/coffee', NEW.id);
  PERFORM public.push_notification(NEW.user2_id, NEW.user1_id, 'coffee_match', 'New coffee match',
    'You have a new coffee match', '/coffee', NEW.id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_coffee_match ON public.coffee_matches;
CREATE TRIGGER trg_notify_coffee_match AFTER INSERT ON public.coffee_matches
FOR EACH ROW EXECUTE FUNCTION public.notify_coffee_match();

CREATE OR REPLACE FUNCTION public.notify_coffee_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE other uuid;
BEGIN
  SELECT CASE WHEN user1_id = NEW.sender_id THEN user2_id ELSE user1_id END INTO other
  FROM public.coffee_matches WHERE id = NEW.match_id;
  PERFORM public.push_notification(other, NEW.sender_id, 'coffee_message', 'New coffee message',
    public.actor_name(NEW.sender_id) || ' sent you a message', '/coffee', NEW.match_id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_coffee_message ON public.coffee_match_messages;
CREATE TRIGGER trg_notify_coffee_message AFTER INSERT ON public.coffee_match_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_coffee_message();
