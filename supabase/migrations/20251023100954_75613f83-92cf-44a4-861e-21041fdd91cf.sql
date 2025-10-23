-- Fix security warning: Set search_path for functions

-- Update the three new functions to set search_path
CREATE OR REPLACE FUNCTION update_fashion_design_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fashion_designs
    SET likes_count = likes_count + 1
    WHERE id = NEW.design_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fashion_designs
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.design_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_challenge_submission_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fashion_challenge_submissions
    SET votes_count = votes_count + 1
    WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fashion_challenge_submissions
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_marketplace_sales_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fashion_marketplace
  SET sales_count = sales_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$;