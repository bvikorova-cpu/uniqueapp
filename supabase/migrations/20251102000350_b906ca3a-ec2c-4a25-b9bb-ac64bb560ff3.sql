-- Fix search path for character post likes count function
CREATE OR REPLACE FUNCTION public.update_character_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.character_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.character_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix search path for character post comments count function
CREATE OR REPLACE FUNCTION public.update_character_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.character_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.character_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix search path for battle votes count function
CREATE OR REPLACE FUNCTION public.update_battle_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.character_id = (SELECT character1_id FROM public.character_battles WHERE id = NEW.battle_id) THEN
      UPDATE public.character_battles
      SET character1_votes = character1_votes + 1
      WHERE id = NEW.battle_id;
    ELSE
      UPDATE public.character_battles
      SET character2_votes = character2_votes + 1
      WHERE id = NEW.battle_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;