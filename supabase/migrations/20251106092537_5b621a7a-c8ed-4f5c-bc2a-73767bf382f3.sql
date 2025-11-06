-- Fix security issues by setting search_path on functions
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET 
      rating_average = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = OLD.reviewed_user_id
      ), 0.00),
      total_reviews = COALESCE((
        SELECT COUNT(*)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = OLD.reviewed_user_id
      ), 0)
    WHERE id = OLD.reviewed_user_id;
    RETURN OLD;
  ELSE
    UPDATE profiles
    SET 
      rating_average = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id
      ), 0.00),
      total_reviews = COALESCE((
        SELECT COUNT(*)
        FROM skill_swap_reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id
      ), 0)
    WHERE id = NEW.reviewed_user_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_completed_exchanges()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
    
    UPDATE profiles
    SET completed_exchanges = completed_exchanges + 1
    WHERE id IN (NEW.user1_id, NEW.user2_id);
  END IF;
  RETURN NEW;
END;
$$;