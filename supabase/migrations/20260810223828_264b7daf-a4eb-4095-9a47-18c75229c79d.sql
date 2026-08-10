CREATE TABLE public.card_category_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_slug TEXT NOT NULL,
  cards_total INTEGER NOT NULL DEFAULT 0,
  share_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_slug)
);

GRANT SELECT ON public.card_category_badges TO anon;
GRANT SELECT ON public.card_category_badges TO authenticated;
GRANT ALL ON public.card_category_badges TO service_role;

ALTER TABLE public.card_category_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are publicly viewable"
  ON public.card_category_badges FOR SELECT USING (true);

CREATE INDEX idx_card_category_badges_user ON public.card_category_badges(user_id);

CREATE OR REPLACE FUNCTION public.award_card_category_badge(_category_slug TEXT)
RETURNS TABLE (id UUID, category_slug TEXT, cards_total INTEGER, share_code TEXT, earned_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _total INTEGER;
  _owned INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT count(*) INTO _total
  FROM public.card_collectibles c
  WHERE c.category_slug = _category_slug AND c.is_prime = false;

  IF _total = 0 THEN
    RAISE EXCEPTION 'Unknown category';
  END IF;

  SELECT count(DISTINCT u.collectible_id) INTO _owned
  FROM public.user_card_collection u
  JOIN public.card_collectibles c ON c.id = u.collectible_id
  WHERE u.user_id = _uid AND c.category_slug = _category_slug AND c.is_prime = false;

  IF _owned < _total THEN
    RAISE EXCEPTION 'Category not complete yet (% of %)', _owned, _total;
  END IF;

  INSERT INTO public.card_category_badges (user_id, category_slug, cards_total)
  VALUES (_uid, _category_slug, _total)
  ON CONFLICT (user_id, category_slug) DO UPDATE SET cards_total = EXCLUDED.cards_total;

  RETURN QUERY
  SELECT b.id, b.category_slug, b.cards_total, b.share_code, b.earned_at
  FROM public.card_category_badges b
  WHERE b.user_id = _uid AND b.category_slug = _category_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_card_category_badge(TEXT) TO authenticated;