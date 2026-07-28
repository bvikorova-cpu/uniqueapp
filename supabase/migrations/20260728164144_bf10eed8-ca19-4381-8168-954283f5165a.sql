
-- Story replies -> notify recipient
CREATE OR REPLACE FUNCTION public.notify_story_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE sender_name text;
BEGIN
  IF NEW.recipient_id IS NULL OR NEW.recipient_id = NEW.sender_id THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, username, 'Someone') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, type, actor_id, title, message, action_url)
  VALUES (NEW.recipient_id, 'story_reply', NEW.sender_id, 'New story reply',
          COALESCE(sender_name,'Someone') || ' replied to your story', '/wall/messages');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_story_reply ON public.story_replies;
CREATE TRIGGER trg_notify_story_reply AFTER INSERT ON public.story_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_story_reply();

-- Story reactions -> notify story owner
CREATE OR REPLACE FUNCTION public.notify_story_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE owner_id uuid; actor_name text;
BEGIN
  SELECT user_id INTO owner_id FROM public.stories WHERE id = NEW.story_id;
  IF owner_id IS NULL OR owner_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, username, 'Someone') INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  INSERT INTO public.notifications (user_id, type, actor_id, title, message, action_url)
  VALUES (owner_id, 'story_reaction', NEW.user_id, 'Story reaction',
          COALESCE(actor_name,'Someone') || ' reacted to your story', '/wall');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_story_reaction ON public.story_reactions;
CREATE TRIGGER trg_notify_story_reaction AFTER INSERT ON public.story_reactions
FOR EACH ROW EXECUTE FUNCTION public.notify_story_reaction();

-- Post shares -> notify original author
CREATE OR REPLACE FUNCTION public.notify_post_share()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE owner_id uuid; actor_name text;
BEGIN
  SELECT user_id INTO owner_id FROM public.posts WHERE id = NEW.original_post_id;
  IF owner_id IS NULL OR owner_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, username, 'Someone') INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  INSERT INTO public.notifications (user_id, type, actor_id, post_id, title, message, action_url)
  VALUES (owner_id, 'post_share', NEW.user_id, NEW.original_post_id, 'Post shared',
          COALESCE(actor_name,'Someone') || ' shared your post', '/post/' || NEW.original_post_id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_post_share ON public.post_shares;
CREATE TRIGGER trg_notify_post_share AFTER INSERT ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION public.notify_post_share();
