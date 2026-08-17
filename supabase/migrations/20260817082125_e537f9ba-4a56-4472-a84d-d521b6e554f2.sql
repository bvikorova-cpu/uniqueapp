
CREATE TABLE IF NOT EXISTS public.coffee_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  liked boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_user_id)
);
GRANT SELECT, INSERT ON public.coffee_swipes TO authenticated;
GRANT ALL ON public.coffee_swipes TO service_role;
ALTER TABLE public.coffee_swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own swipes read" ON public.coffee_swipes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own swipes insert" ON public.coffee_swipes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.coffee_gifts_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT '☕',
  credit_cost integer NOT NULL DEFAULT 3,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coffee_gifts_catalog TO authenticated;
GRANT ALL ON public.coffee_gifts_catalog TO service_role;
ALTER TABLE public.coffee_gifts_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog read" ON public.coffee_gifts_catalog FOR SELECT TO authenticated USING (is_active);

INSERT INTO public.coffee_gifts_catalog (name, icon, credit_cost)
SELECT * FROM (VALUES
  ('Espresso','☕',2),
  ('Cappuccino','🥛',3),
  ('Croissant','🥐',4),
  ('Cheesecake','🍰',6),
  ('Coffee Beans','🫘',8),
  ('Golden Cup','🏆',15)
) v(name, icon, credit_cost)
WHERE NOT EXISTS (SELECT 1 FROM public.coffee_gifts_catalog);

CREATE TABLE IF NOT EXISTS public.coffee_gifts_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  match_id uuid,
  gift_id uuid NOT NULL REFERENCES public.coffee_gifts_catalog(id),
  credits_spent integer NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coffee_gifts_sent TO authenticated;
GRANT ALL ON public.coffee_gifts_sent TO service_role;
ALTER TABLE public.coffee_gifts_sent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gifts participants read" ON public.coffee_gifts_sent FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_coffee_gifts_sent_match ON public.coffee_gifts_sent(match_id, created_at);

-- Discovery: coffee buddy candidates not yet swiped
CREATE OR REPLACE FUNCTION public.coffee_discover_candidates(_limit integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  bio text,
  favorite_coffee_types text[],
  preferred_atmosphere text[],
  budget_preference text,
  total_checkins integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.bio,
         cp.favorite_coffee_types, cp.preferred_atmosphere,
         cp.budget_preference, COALESCE(cp.total_checkins, 0)
  FROM public.profiles p
  LEFT JOIN public.coffee_profiles cp ON cp.user_id = p.id
  WHERE p.id <> auth.uid()
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.coffee_swipes s
      WHERE s.user_id = auth.uid() AND s.target_user_id = p.id
    )
  ORDER BY (cp.user_id IS NOT NULL) DESC, p.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 50);
$$;
GRANT EXECUTE ON FUNCTION public.coffee_discover_candidates(integer) TO authenticated;

-- Swipe: right swipe costs credits and opens a chat immediately
CREATE OR REPLACE FUNCTION public.coffee_swipe(_target_user_id uuid, _liked boolean, _cost integer DEFAULT 2)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _match uuid;
  _ok boolean;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _target_user_id = _me THEN RAISE EXCEPTION 'Cannot swipe yourself'; END IF;

  INSERT INTO public.coffee_swipes (user_id, target_user_id, liked)
  VALUES (_me, _target_user_id, COALESCE(_liked, false))
  ON CONFLICT (user_id, target_user_id) DO UPDATE SET liked = EXCLUDED.liked;

  IF NOT COALESCE(_liked, false) THEN
    RETURN jsonb_build_object('liked', false);
  END IF;

  PERFORM set_config('app.credit_reason', 'coffee_swipe_like', true);
  PERFORM set_config('app.credit_source', 'coffee', true);
  SELECT public.deduct_ai_credits(_me, GREATEST(COALESCE(_cost, 2), 0), 'coffee_swipe_like', 'coffee') INTO _ok;
  IF _ok IS FALSE THEN
    RETURN jsonb_build_object('liked', true, 'insufficient_credits', true);
  END IF;

  SELECT id INTO _match FROM public.coffee_matches
  WHERE (user1_id = _me AND user2_id = _target_user_id)
     OR (user1_id = _target_user_id AND user2_id = _me)
  LIMIT 1;

  IF _match IS NULL THEN
    INSERT INTO public.coffee_matches (user1_id, user2_id, match_score, status, chat_enabled)
    VALUES (_me, _target_user_id, 100, 'accepted', true)
    RETURNING id INTO _match;
  ELSE
    UPDATE public.coffee_matches SET status = 'accepted', chat_enabled = true, updated_at = now()
    WHERE id = _match;
  END IF;

  RETURN jsonb_build_object('liked', true, 'match_id', _match);
END;
$$;
GRANT EXECUTE ON FUNCTION public.coffee_swipe(uuid, boolean, integer) TO authenticated;

-- Send a credit-paid gift inside a coffee chat
CREATE OR REPLACE FUNCTION public.coffee_send_gift(_match_id uuid, _gift_id uuid, _message text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _other uuid;
  _cost integer;
  _name text;
  _icon text;
  _ok boolean;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT CASE WHEN user1_id = _me THEN user2_id ELSE user1_id END INTO _other
  FROM public.coffee_matches
  WHERE id = _match_id AND (user1_id = _me OR user2_id = _me);
  IF _other IS NULL THEN RAISE EXCEPTION 'Chat not found'; END IF;

  SELECT credit_cost, name, icon INTO _cost, _name, _icon
  FROM public.coffee_gifts_catalog WHERE id = _gift_id AND is_active;
  IF _cost IS NULL THEN RAISE EXCEPTION 'Gift not found'; END IF;

  PERFORM set_config('app.credit_reason', 'coffee_gift', true);
  PERFORM set_config('app.credit_source', 'coffee', true);
  SELECT public.deduct_ai_credits(_me, _cost, 'coffee_gift', 'coffee') INTO _ok;
  IF _ok IS FALSE THEN
    RETURN jsonb_build_object('ok', false, 'insufficient_credits', true, 'cost', _cost);
  END IF;

  INSERT INTO public.coffee_gifts_sent (sender_id, recipient_id, match_id, gift_id, credits_spent, message)
  VALUES (_me, _other, _match_id, _gift_id, _cost, _message);

  INSERT INTO public.coffee_match_messages (match_id, sender_id, message)
  VALUES (_match_id, _me, _icon || ' Gift: ' || _name || COALESCE(' — ' || _message, ''));

  RETURN jsonb_build_object('ok', true, 'cost', _cost);
END;
$$;
GRANT EXECUTE ON FUNCTION public.coffee_send_gift(uuid, uuid, text) TO authenticated;
