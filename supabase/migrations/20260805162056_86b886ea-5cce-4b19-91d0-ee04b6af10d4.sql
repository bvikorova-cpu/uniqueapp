DROP TRIGGER IF EXISTS create_match_on_mutual_like ON public.dating_swipes;

CREATE TRIGGER create_match_on_mutual_like
AFTER INSERT OR UPDATE OF action ON public.dating_swipes
FOR EACH ROW EXECUTE FUNCTION public.check_and_create_match();

-- Backfill: create matches for any existing mutual likes that were missed.
INSERT INTO public.dating_matches (user1_id, user2_id)
SELECT DISTINCT LEAST(a.swiper_id, a.swiped_id), GREATEST(a.swiper_id, a.swiped_id)
FROM public.dating_swipes a
JOIN public.dating_swipes b
  ON b.swiper_id = a.swiped_id AND b.swiped_id = a.swiper_id
WHERE a.action = 'like' AND b.action = 'like'
ON CONFLICT (user1_id, user2_id) DO NOTHING;