-- Fix function search_path security
DROP FUNCTION IF EXISTS public.increment_story_support() CASCADE;

CREATE OR REPLACE FUNCTION public.increment_story_support()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE public.safety_stories 
  SET support_count = support_count + 1 
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_story_support_added
  AFTER INSERT ON public.safety_story_supports
  FOR EACH ROW EXECUTE FUNCTION public.increment_story_support();