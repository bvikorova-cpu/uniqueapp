
-- Generic notification helper
CREATE OR REPLACE FUNCTION public.push_notification(
  _user_id uuid, _actor_id uuid, _type text, _title text, _message text,
  _action_url text DEFAULT NULL, _related_id uuid DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;
  IF _actor_id IS NOT NULL AND _actor_id = _user_id THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
  VALUES (_user_id, _actor_id, _type, _title, _message, _action_url, _related_id);
EXCEPTION WHEN OTHERS THEN RETURN;
END; $$;

-- ===== Follows =====
CREATE OR REPLACE FUNCTION public.notify_new_follower() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid; _actor uuid;
BEGIN
  IF TG_TABLE_NAME = 'influencer_followers' THEN
    _actor := NEW.follower_id;
    SELECT user_id INTO _target FROM public.influencer_profiles WHERE id = NEW.influencer_id;
  ELSIF TG_TABLE_NAME = 'page_followers' THEN
    _actor := NEW.user_id; _target := NULL;
    SELECT owner_id INTO _target FROM public.pages WHERE id = NEW.page_id;
  ELSIF TG_TABLE_NAME = 'fan_club_memberships' THEN
    _actor := NEW.fan_user_id; _target := NEW.talent_user_id;
  ELSE
    _actor := NEW.follower_id; _target := NEW.following_id;
  END IF;
  PERFORM public.push_notification(_target, _actor, 'follow',
    'New follower', public.actor_name(_actor) || ' started following you',
    '/profile/' || _actor::text, _actor);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();

DROP TRIGGER IF EXISTS trg_notify_influencer_follow ON public.influencer_followers;
CREATE TRIGGER trg_notify_influencer_follow AFTER INSERT ON public.influencer_followers
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();

DROP TRIGGER IF EXISTS trg_notify_fan_club_membership ON public.fan_club_memberships;
CREATE TRIGGER trg_notify_fan_club_membership AFTER INSERT ON public.fan_club_memberships
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();

-- ===== Tips =====
CREATE OR REPLACE FUNCTION public.notify_tip_received() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid; _actor uuid; _amount numeric; _url text;
BEGIN
  IF TG_TABLE_NAME = 'profile_tips' THEN
    _target := NEW.recipient_id; _actor := NEW.sender_id;
    _amount := COALESCE(NEW.amount_cents/100.0, NEW.amount); _url := '/wall';
  ELSIF TG_TABLE_NAME = 'live_tips' THEN
    _target := NEW.streamer_id; _actor := NEW.tipper_id;
    _amount := NEW.amount_cents/100.0; _url := '/influ-king';
  ELSIF TG_TABLE_NAME = 'megatalent_tips' THEN
    _target := NEW.creator_id; _actor := NEW.tipper_id;
    _amount := NEW.amount_cents/100.0; _url := '/megatalent';
  ELSE
    SELECT user_id INTO _target FROM public.influencer_profiles WHERE id = NEW.influencer_id;
    _actor := NEW.sender_id; _amount := NEW.amount; _url := '/influencer/earnings';
  END IF;
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.status,'') = COALESCE(OLD.status,'') THEN RETURN NEW; END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('completed','paid','succeeded') THEN RETURN NEW; END IF;
  PERFORM public.push_notification(_target, _actor, 'tip_received',
    'You received a tip', public.actor_name(_actor) || ' sent you €' || to_char(COALESCE(_amount,0), 'FM999999990.00'),
    _url, NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_profile_tip ON public.profile_tips;
CREATE TRIGGER trg_notify_profile_tip AFTER INSERT OR UPDATE ON public.profile_tips
FOR EACH ROW EXECUTE FUNCTION public.notify_tip_received();

DROP TRIGGER IF EXISTS trg_notify_live_tip ON public.live_tips;
CREATE TRIGGER trg_notify_live_tip AFTER INSERT OR UPDATE ON public.live_tips
FOR EACH ROW EXECUTE FUNCTION public.notify_tip_received();

DROP TRIGGER IF EXISTS trg_notify_megatalent_tip ON public.megatalent_tips;
CREATE TRIGGER trg_notify_megatalent_tip AFTER INSERT OR UPDATE ON public.megatalent_tips
FOR EACH ROW EXECUTE FUNCTION public.notify_tip_received();

DROP TRIGGER IF EXISTS trg_notify_influencer_tip ON public.influencer_tips;
CREATE TRIGGER trg_notify_influencer_tip AFTER INSERT OR UPDATE ON public.influencer_tips
FOR EACH ROW EXECUTE FUNCTION public.notify_tip_received();

-- ===== Influencer gifts =====
CREATE OR REPLACE FUNCTION public.notify_influencer_gift() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.status,'') = COALESCE(OLD.status,'') THEN RETURN NEW; END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('completed','paid','succeeded') THEN RETURN NEW; END IF;
  SELECT user_id INTO _target FROM public.influencer_profiles WHERE id = NEW.influencer_id;
  PERFORM public.push_notification(_target, NEW.sender_id, 'creator_gift',
    'You received a gift', public.actor_name(NEW.sender_id) || ' sent you a gift',
    '/influencer/earnings', NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_influencer_sent_gift ON public.influencer_sent_gifts;
CREATE TRIGGER trg_notify_influencer_sent_gift AFTER INSERT OR UPDATE ON public.influencer_sent_gifts
FOR EACH ROW EXECUTE FUNCTION public.notify_influencer_gift();

-- ===== Post likes (influencer + creator) =====
CREATE OR REPLACE FUNCTION public.notify_creator_post_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid; _url text;
BEGIN
  IF TG_TABLE_NAME = 'influencer_post_likes' THEN
    SELECT ip.user_id INTO _target FROM public.influencer_posts p
      JOIN public.influencer_profiles ip ON ip.id = p.influencer_id WHERE p.id = NEW.post_id;
    _url := '/influ-king';
  ELSE
    SELECT creator_id INTO _target FROM public.creator_exclusive_posts WHERE id = NEW.post_id;
    _url := '/influ-king';
  END IF;
  PERFORM public.push_notification(_target, NEW.user_id, 'post_like',
    'New like', public.actor_name(NEW.user_id) || ' liked your post', _url, NEW.post_id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_influencer_post_like ON public.influencer_post_likes;
CREATE TRIGGER trg_notify_influencer_post_like AFTER INSERT ON public.influencer_post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_post_like();

DROP TRIGGER IF EXISTS trg_notify_creator_post_like ON public.creator_post_likes;
CREATE TRIGGER trg_notify_creator_post_like AFTER INSERT ON public.creator_post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_post_like();

-- ===== Subscriptions / memberships =====
CREATE OR REPLACE FUNCTION public.notify_new_subscriber() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid; _actor uuid;
BEGIN
  IF TG_TABLE_NAME = 'influencer_fan_club_members' THEN
    SELECT creator_id INTO _target FROM public.influencer_fan_clubs WHERE id = NEW.fan_club_id;
    _actor := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'influencer_subscriptions' THEN
    SELECT user_id INTO _target FROM public.influencer_profiles WHERE id = NEW.influencer_id;
    _actor := NEW.subscriber_user_id;
  ELSE
    _target := NEW.creator_id; _actor := NEW.subscriber_id;
  END IF;
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.status,'') = COALESCE(OLD.status,'') THEN RETURN NEW; END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('active','trialing') THEN RETURN NEW; END IF;
  PERFORM public.push_notification(_target, _actor, 'new_subscriber',
    'New subscriber', public.actor_name(_actor) || ' subscribed to you',
    '/influencer/earnings', NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_creator_subscription ON public.creator_subscriptions;
CREATE TRIGGER trg_notify_creator_subscription AFTER INSERT OR UPDATE ON public.creator_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.notify_new_subscriber();

DROP TRIGGER IF EXISTS trg_notify_creator_membership ON public.creator_memberships;
CREATE TRIGGER trg_notify_creator_membership AFTER INSERT OR UPDATE ON public.creator_memberships
FOR EACH ROW EXECUTE FUNCTION public.notify_new_subscriber();

DROP TRIGGER IF EXISTS trg_notify_influencer_subscription ON public.influencer_subscriptions;
CREATE TRIGGER trg_notify_influencer_subscription AFTER INSERT OR UPDATE ON public.influencer_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.notify_new_subscriber();

DROP TRIGGER IF EXISTS trg_notify_fan_club_member ON public.influencer_fan_club_members;
CREATE TRIGGER trg_notify_fan_club_member AFTER INSERT OR UPDATE ON public.influencer_fan_club_members
FOR EACH ROW EXECUTE FUNCTION public.notify_new_subscriber();

-- ===== Fan club post -> notify members =====
CREATE OR REPLACE FUNCTION public.notify_fan_club_post() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id FROM public.influencer_fan_club_members
           WHERE fan_club_id = NEW.fan_club_id AND COALESCE(status,'active') = 'active' LOOP
    PERFORM public.push_notification(r.user_id, NEW.creator_id, 'fan_club_post',
      'New fan club post', public.actor_name(NEW.creator_id) || ' posted: ' || COALESCE(NEW.title,'new content'),
      '/influ-king', NEW.id);
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_fan_club_post ON public.influencer_fan_club_posts;
CREATE TRIGGER trg_notify_fan_club_post AFTER INSERT ON public.influencer_fan_club_posts
FOR EACH ROW EXECUTE FUNCTION public.notify_fan_club_post();

-- ===== Purchases (PPV, packs, merch, live access) =====
CREATE OR REPLACE FUNCTION public.notify_creator_purchase() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid; _actor uuid; _label text;
BEGIN
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.status,'') = COALESCE(OLD.status,'') THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'influking_ppv_unlocks' THEN
    _target := NEW.creator_id; _actor := NEW.buyer_id; _label := 'unlocked your pay-per-view post';
  ELSIF TG_TABLE_NAME = 'creator_content_purchases' THEN
    _target := NEW.creator_id; _actor := NEW.buyer_id; _label := 'bought your content pack';
  ELSIF TG_TABLE_NAME = 'creator_merch_orders' THEN
    _target := NEW.creator_id; _actor := NEW.buyer_id; _label := 'ordered your merch';
  ELSE
    SELECT creator_id INTO _target FROM public.creator_live_streams WHERE id = NEW.stream_id;
    _actor := NEW.user_id; _label := 'bought access to your live stream';
  END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('completed','paid','succeeded','unlocked') THEN RETURN NEW; END IF;
  PERFORM public.push_notification(_target, _actor, 'creator_purchase',
    'New purchase', public.actor_name(_actor) || ' ' || _label, '/influencer/earnings', NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_ppv_unlock ON public.influking_ppv_unlocks;
CREATE TRIGGER trg_notify_ppv_unlock AFTER INSERT OR UPDATE ON public.influking_ppv_unlocks
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_purchase();

DROP TRIGGER IF EXISTS trg_notify_content_purchase ON public.creator_content_purchases;
CREATE TRIGGER trg_notify_content_purchase AFTER INSERT OR UPDATE ON public.creator_content_purchases
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_purchase();

DROP TRIGGER IF EXISTS trg_notify_merch_order ON public.creator_merch_orders;
CREATE TRIGGER trg_notify_merch_order AFTER INSERT OR UPDATE ON public.creator_merch_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_purchase();

DROP TRIGGER IF EXISTS trg_notify_live_access ON public.creator_live_stream_access;
CREATE TRIGGER trg_notify_live_access AFTER INSERT ON public.creator_live_stream_access
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_purchase();

-- ===== Paid messages =====
CREATE OR REPLACE FUNCTION public.notify_creator_paid_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.push_notification(NEW.creator_id, NEW.sender_id, 'creator_message',
      'New paid message', public.actor_name(NEW.sender_id) || ' sent you a paid message',
      '/influ-king', NEW.id);
  ELSIF NEW.reply IS NOT NULL AND COALESCE(OLD.reply,'') <> NEW.reply THEN
    PERFORM public.push_notification(NEW.sender_id, NEW.creator_id, 'creator_message',
      'Creator replied', public.actor_name(NEW.creator_id) || ' replied to your message',
      '/influ-king', NEW.id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_creator_paid_message ON public.creator_paid_messages;
CREATE TRIGGER trg_notify_creator_paid_message AFTER INSERT OR UPDATE ON public.creator_paid_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_paid_message();

-- ===== Creator chat rooms =====
CREATE OR REPLACE FUNCTION public.notify_creator_chat_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _creator uuid;
BEGIN
  SELECT creator_id INTO _creator FROM public.creator_chat_rooms WHERE id = NEW.room_id;
  PERFORM public.push_notification(_creator, NEW.user_id, 'creator_message',
    'New chat message', public.actor_name(NEW.user_id) || ' wrote in your chat room',
    '/influ-king', NEW.room_id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_creator_chat_message ON public.creator_chat_messages;
CREATE TRIGGER trg_notify_creator_chat_message AFTER INSERT ON public.creator_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_creator_chat_message();

-- ===== Brand deal applications =====
CREATE OR REPLACE FUNCTION public.notify_brand_deal_application() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT generated_for INTO _owner FROM public.influking_brand_deals WHERE id = NEW.deal_id;
    PERFORM public.push_notification(_owner, NEW.user_id, 'brand_deal_application',
      'New brand deal application', public.actor_name(NEW.user_id) || ' applied to your brand deal',
      '/influ-king', NEW.deal_id);
  ELSIF COALESCE(OLD.status,'') <> COALESCE(NEW.status,'') THEN
    PERFORM public.push_notification(NEW.user_id, NULL, 'brand_deal_status',
      'Brand deal update', 'Your application is now: ' || NEW.status, '/influ-king', NEW.deal_id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_brand_deal_application ON public.influking_brand_deal_applications;
CREATE TRIGGER trg_notify_brand_deal_application AFTER INSERT OR UPDATE ON public.influking_brand_deal_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_brand_deal_application();

-- ===== Challenge submissions reviewed =====
CREATE OR REPLACE FUNCTION public.notify_challenge_submission() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND COALESCE(OLD.status,'') <> COALESCE(NEW.status,'') THEN
    PERFORM public.push_notification(NEW.user_id, NEW.reviewed_by, 'challenge_reviewed',
      'Challenge submission ' || NEW.status,
      'Your challenge submission was ' || NEW.status, '/influ-king', NEW.challenge_id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_challenge_submission ON public.influking_challenge_submissions;
CREATE TRIGGER trg_notify_challenge_submission AFTER UPDATE ON public.influking_challenge_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_challenge_submission();
