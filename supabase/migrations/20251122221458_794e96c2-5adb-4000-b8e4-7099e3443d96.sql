-- Fix search_path for update_hashtag_count function
CREATE OR REPLACE FUNCTION public.update_hashtag_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hashtags SET use_count = use_count + 1 WHERE id = NEW.hashtag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.hashtags SET use_count = use_count - 1 WHERE id = OLD.hashtag_id;
  END IF;
  RETURN NEW;
END;
$$;