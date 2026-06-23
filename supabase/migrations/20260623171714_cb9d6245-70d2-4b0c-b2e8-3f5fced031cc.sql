
-- Helper: resolve owner of a campaign by type
CREATE OR REPLACE FUNCTION public.get_campaign_owner(_campaign_id uuid, _campaign_type text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
BEGIN
  CASE _campaign_type
    WHEN 'medical' THEN SELECT user_id INTO _owner FROM public.medical_campaigns WHERE id = _campaign_id;
    WHEN 'dream'   THEN SELECT user_id INTO _owner FROM public.dream_campaigns WHERE id = _campaign_id;
    WHEN 'hero'    THEN SELECT user_id INTO _owner FROM public.hero_campaigns WHERE id = _campaign_id;
    WHEN 'pet'     THEN SELECT user_id INTO _owner FROM public.pet_rescue_campaigns WHERE id = _campaign_id;
    WHEN 'student' THEN SELECT user_id INTO _owner FROM public.student_campaigns WHERE id = _campaign_id;
    WHEN 'crisis'  THEN SELECT user_id INTO _owner FROM public.crisis_campaigns WHERE id = _campaign_id;
    WHEN 'talent'  THEN SELECT user_id INTO _owner FROM public.talent_campaigns WHERE id = _campaign_id;
    ELSE _owner := NULL;
  END CASE;
  RETURN _owner;
END;
$$;

-- Helper: campaign title (used in notification text)
CREATE OR REPLACE FUNCTION public.get_campaign_title(_campaign_id uuid, _campaign_type text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _t text;
BEGIN
  CASE _campaign_type
    WHEN 'medical' THEN SELECT title INTO _t FROM public.medical_campaigns WHERE id = _campaign_id;
    WHEN 'dream'   THEN SELECT title INTO _t FROM public.dream_campaigns WHERE id = _campaign_id;
    WHEN 'hero'    THEN SELECT title INTO _t FROM public.hero_campaigns WHERE id = _campaign_id;
    WHEN 'pet'     THEN SELECT title INTO _t FROM public.pet_rescue_campaigns WHERE id = _campaign_id;
    WHEN 'student' THEN SELECT title INTO _t FROM public.student_campaigns WHERE id = _campaign_id;
    WHEN 'crisis'  THEN SELECT title INTO _t FROM public.crisis_campaigns WHERE id = _campaign_id;
    WHEN 'talent'  THEN SELECT title INTO _t FROM public.talent_campaigns WHERE id = _campaign_id;
    ELSE _t := 'campaign';
  END CASE;
  RETURN COALESCE(_t, 'campaign');
END;
$$;

-- campaign_comments
CREATE TABLE IF NOT EXISTS public.campaign_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  campaign_type text NOT NULL CHECK (campaign_type IN ('medical','dream','hero','pet','student','crisis','talent')),
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaign_comments_camp ON public.campaign_comments(campaign_id, campaign_type, created_at DESC);

GRANT SELECT ON public.campaign_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_comments TO authenticated;
GRANT ALL ON public.campaign_comments TO service_role;

ALTER TABLE public.campaign_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read campaign comments"
  ON public.campaign_comments FOR SELECT USING (true);
CREATE POLICY "Authed can post own comment"
  ON public.campaign_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Author can delete own comment"
  ON public.campaign_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- campaign_updates (creator-only updates)
CREATE TABLE IF NOT EXISTS public.campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  campaign_type text NOT NULL CHECK (campaign_type IN ('medical','dream','hero','pet','student','crisis','talent')),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_camp ON public.campaign_updates(campaign_id, campaign_type, created_at DESC);

GRANT SELECT ON public.campaign_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_updates TO authenticated;
GRANT ALL ON public.campaign_updates TO service_role;

ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read campaign updates"
  ON public.campaign_updates FOR SELECT USING (true);
CREATE POLICY "Only owner can post update"
  ON public.campaign_updates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid() = public.get_campaign_owner(campaign_id, campaign_type));
CREATE POLICY "Owner can delete own update"
  ON public.campaign_updates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_updates;

-- ===== Trigger: new donation -> notify campaign owner =====
CREATE OR REPLACE FUNCTION public.notify_on_campaign_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
  _title text;
  _donor text;
BEGIN
  IF NEW.status <> 'completed' THEN RETURN NEW; END IF;
  _owner := public.get_campaign_owner(NEW.campaign_id, NEW.campaign_type);
  IF _owner IS NULL OR _owner = NEW.donor_id THEN RETURN NEW; END IF;
  _title := public.get_campaign_title(NEW.campaign_id, NEW.campaign_type);
  _donor := CASE WHEN NEW.is_anonymous OR NEW.donor_name IS NULL
                 THEN 'An anonymous donor' ELSE NEW.donor_name END;

  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  VALUES (
    _owner,
    'donation_received',
    'New donation received',
    _donor || ' donated €' || NEW.amount::text || ' to ' || _title,
    '/fundraising/' || NEW.campaign_type || '/' || NEW.campaign_id::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_campaign_donation ON public.campaign_donations;
CREATE TRIGGER trg_notify_campaign_donation
AFTER INSERT ON public.campaign_donations
FOR EACH ROW EXECUTE FUNCTION public.notify_on_campaign_donation();

-- Also fire when status flips to completed via UPDATE (Stripe webhook)
CREATE OR REPLACE FUNCTION public.notify_on_campaign_donation_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND COALESCE(OLD.status,'') <> 'completed' THEN
    PERFORM public.notify_on_campaign_donation();
    -- Re-use logic by inlining (PERFORM cannot pass NEW context)
    DECLARE
      _owner uuid := public.get_campaign_owner(NEW.campaign_id, NEW.campaign_type);
      _title text := public.get_campaign_title(NEW.campaign_id, NEW.campaign_type);
      _donor text := CASE WHEN NEW.is_anonymous OR NEW.donor_name IS NULL
                     THEN 'An anonymous donor' ELSE NEW.donor_name END;
    BEGIN
      IF _owner IS NOT NULL AND _owner <> COALESCE(NEW.donor_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
        INSERT INTO public.notifications (user_id, type, title, message, action_url)
        VALUES (_owner, 'donation_received', 'New donation received',
                _donor || ' donated €' || NEW.amount::text || ' to ' || _title,
                '/fundraising/' || NEW.campaign_type || '/' || NEW.campaign_id::text);
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_campaign_donation_upd ON public.campaign_donations;
CREATE TRIGGER trg_notify_campaign_donation_upd
AFTER UPDATE OF status ON public.campaign_donations
FOR EACH ROW EXECUTE FUNCTION public.notify_on_campaign_donation_update();

-- ===== Trigger: new comment -> notify owner =====
CREATE OR REPLACE FUNCTION public.notify_on_campaign_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid := public.get_campaign_owner(NEW.campaign_id, NEW.campaign_type);
  _title text := public.get_campaign_title(NEW.campaign_id, NEW.campaign_type);
BEGIN
  IF _owner IS NULL OR _owner = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  VALUES (
    _owner, 'campaign_comment', 'New comment on your campaign',
    'Someone commented on "' || _title || '"',
    '/fundraising/' || NEW.campaign_type || '/' || NEW.campaign_id::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_campaign_comment ON public.campaign_comments;
CREATE TRIGGER trg_notify_campaign_comment
AFTER INSERT ON public.campaign_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_campaign_comment();

-- ===== Trigger: new update -> notify all donors =====
CREATE OR REPLACE FUNCTION public.notify_on_campaign_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _title text := public.get_campaign_title(NEW.campaign_id, NEW.campaign_type);
  _url text := '/fundraising/' || NEW.campaign_type || '/' || NEW.campaign_id::text;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  SELECT DISTINCT d.donor_id,
         'campaign_update',
         'Update from ' || _title,
         NEW.title,
         _url
  FROM public.campaign_donations d
  WHERE d.campaign_id = NEW.campaign_id
    AND d.campaign_type = NEW.campaign_type
    AND d.status = 'completed'
    AND d.donor_id IS NOT NULL
    AND d.donor_id <> NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_campaign_update ON public.campaign_updates;
CREATE TRIGGER trg_notify_campaign_update
AFTER INSERT ON public.campaign_updates
FOR EACH ROW EXECUTE FUNCTION public.notify_on_campaign_update();
