
CREATE OR REPLACE FUNCTION public.notify_saved_search_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
BEGIN
  IF NEW.is_active IS DISTINCT FROM TRUE OR NEW.is_sold = TRUE THEN
    RETURN NEW;
  END IF;

  FOR s IN
    SELECT id, user_id, name, search_term, category, condition, min_price, max_price, location
    FROM public.bazaar_saved_searches
    WHERE notify = TRUE
      AND user_id <> NEW.user_id
      AND (search_term IS NULL OR search_term = '' OR
           NEW.title ILIKE '%' || search_term || '%' OR
           COALESCE(NEW.description,'') ILIKE '%' || search_term || '%')
      AND (category IS NULL OR category = '' OR NEW.category = category)
      AND (condition IS NULL OR condition = '' OR NEW.condition = condition)
      AND (min_price IS NULL OR NEW.price >= min_price)
      AND (max_price IS NULL OR NEW.price <= max_price)
      AND (location IS NULL OR location = '' OR NEW.location ILIKE '%' || location || '%')
  LOOP
    INSERT INTO public.bazaar_notifications (user_id, type, title, message)
    VALUES (
      s.user_id,
      'saved_search_match',
      'New match: ' || s.name,
      NEW.title || ' — €' || NEW.price::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_saved_search_matches ON public.bazaar_items;
CREATE TRIGGER trg_notify_saved_search_matches
AFTER INSERT ON public.bazaar_items
FOR EACH ROW EXECUTE FUNCTION public.notify_saved_search_matches();
