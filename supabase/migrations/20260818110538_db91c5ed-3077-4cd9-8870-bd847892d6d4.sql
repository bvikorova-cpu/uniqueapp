CREATE OR REPLACE FUNCTION public.scrub_contact_info(_t text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v text := _t;
  v_mask text := '[contact hidden]';
BEGIN
  IF v IS NULL OR v = '' THEN RETURN v; END IF;

  -- e-mails (incl. obfuscated "name (at) domain dot com")
  v := regexp_replace(v, '[[:alnum:]._%+-]+\s*(@|\(at\)|\[at\]|\s+at\s+)\s*[[:alnum:].-]+\s*(\.|\(dot\)|\[dot\]|\s+dot\s+)\s*[[:alpha:]]{2,}', v_mask, 'gi');
  -- urls / domains
  v := regexp_replace(v, '(https?://|www\.)[^\s]+', v_mask, 'gi');
  v := regexp_replace(v, '[[:alnum:]-]+\.(com|net|org|sk|cz|eu|io|me|info|shop|online|biz|ru|de|at|hu|pl)(/[^\s]*)?', v_mask, 'gi');
  -- phone numbers (7+ digits, allowing spaces / dashes / dots / parentheses / leading +00)
  v := regexp_replace(v, '(\+|00)?\s*(\(?\d{1,4}\)?[\s.\-/]*){2,}\d{2,}', v_mask, 'g');
  -- long digit runs written as words-free blocks
  v := regexp_replace(v, '\d{7,}', v_mask, 'g');
  -- social handles
  v := regexp_replace(v, '(^|[^[:alnum:]])@[[:alnum:]._]{3,}', '\1' || v_mask, 'g');
  -- messaging apps / socials keywords
  v := regexp_replace(v,
    '(skype|telegram|telegramme|whats\s*app|whatsapp|wa\.me|viber|signal|messenger|snapchat|snap\s*chat|instagram|insta|facebook|fb|tiktok|discord|imessage|kik|wechat|line\s+id|zalo|threema|icq|e-?mail|mail\s*me|call\s*me|phone|mobil|telefon|tel\.?)',
    v_mask, 'gi');

  -- collapse repeated masks
  v := regexp_replace(v, '(\[contact hidden\][\s,;:.\-]*){2,}', v_mask || ' ', 'g');
  RETURN v;
END;
$$;

-- listings ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.scrub_listing_contact_info()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.title := public.scrub_contact_info(NEW.title);
  NEW.description := public.scrub_contact_info(NEW.description);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scrub_contacts_skill_offerings ON public.skill_offerings;
CREATE TRIGGER scrub_contacts_skill_offerings
BEFORE INSERT OR UPDATE OF title, description ON public.skill_offerings
FOR EACH ROW EXECUTE FUNCTION public.scrub_listing_contact_info();

DROP TRIGGER IF EXISTS scrub_contacts_skill_requests ON public.skill_requests;
CREATE TRIGGER scrub_contacts_skill_requests
BEFORE INSERT OR UPDATE OF title, description ON public.skill_requests
FOR EACH ROW EXECUTE FUNCTION public.scrub_listing_contact_info();

DROP TRIGGER IF EXISTS scrub_contacts_properties ON public.properties;
CREATE TRIGGER scrub_contacts_properties
BEFORE INSERT OR UPDATE OF title, description ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.scrub_listing_contact_info();

-- skills chat: scrub until the contact has been unlocked -------------------
CREATE OR REPLACE FUNCTION public.scrub_marketplace_message_contact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_unlocked boolean := false;
BEGIN
  IF NEW.offering_id IS NOT NULL THEN
    v_unlocked := public.has_skill_contact_unlock(NEW.sender_id, NEW.offering_id)
               OR public.has_skill_contact_unlock(NEW.receiver_id, NEW.offering_id);
  END IF;
  IF NOT v_unlocked THEN
    NEW.message := public.scrub_contact_info(NEW.message);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scrub_contacts_marketplace_responses ON public.marketplace_responses;
CREATE TRIGGER scrub_contacts_marketplace_responses
BEFORE INSERT ON public.marketplace_responses
FOR EACH ROW EXECUTE FUNCTION public.scrub_marketplace_message_contact();

-- property chat: scrub the first 3 messages of a conversation --------------
CREATE OR REPLACE FUNCTION public.scrub_property_message_contact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.property_messages
  WHERE property_id = NEW.property_id AND buyer_id = NEW.buyer_id;

  IF COALESCE(v_count, 0) < 3 THEN
    NEW.content := public.scrub_contact_info(NEW.content);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scrub_contacts_property_messages ON public.property_messages;
CREATE TRIGGER scrub_contacts_property_messages
BEFORE INSERT ON public.property_messages
FOR EACH ROW EXECUTE FUNCTION public.scrub_property_message_contact();

-- unlock now costs 2 credits ----------------------------------------------
CREATE OR REPLACE FUNCTION public.unlock_skill_contact(_offering_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_before integer;
  v_after integer;
  v_today integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT o.user_id INTO v_owner FROM public.skill_offerings o WHERE o.id = _offering_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'OFFERING_NOT_FOUND';
  END IF;

  IF v_owner = v_user_id OR public.has_skill_contact_unlock(v_user_id, _offering_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today
  FROM public.skill_contact_unlocks
  WHERE buyer_id = v_user_id AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN
    RAISE EXCEPTION 'RATE_LIMIT: daily contact unlock limit reached (20 per day)';
  END IF;

  SELECT credits_remaining INTO v_before FROM public.ai_credits WHERE user_id = v_user_id;
  v_after := public.deduct_ai_credits_atomic(v_user_id, 2);

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_user_id, -2, COALESCE(v_before, v_after + 2), v_after,
          'skills_marketplace_contact_unlock', 'skills_marketplace', v_user_id,
          jsonb_build_object('offering_id', _offering_id, 'seller_id', v_owner));

  INSERT INTO public.skill_contact_unlocks (offering_id, buyer_id, seller_id)
  VALUES (_offering_id, v_user_id, v_owner)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 2, 'balance', v_after);
END;
$$;