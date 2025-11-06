-- Fix the trigger to properly handle INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_find_skill_matches ON public.profiles;

CREATE OR REPLACE FUNCTION public.trigger_find_skill_matches()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if skills changed
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (
       (OLD.skills_offered IS DISTINCT FROM NEW.skills_offered) 
       OR (OLD.skills_wanted IS DISTINCT FROM NEW.skills_wanted)
     )) THEN
    PERFORM find_skill_matches(NEW.id);
    
    -- Also update matches for users who might match with this user
    PERFORM find_skill_matches(p.id)
    FROM profiles p
    WHERE p.id != NEW.id
      AND (
        p.skills_offered && NEW.skills_wanted
        OR p.skills_wanted && NEW.skills_offered
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER trigger_find_skill_matches
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_find_skill_matches();