CREATE OR REPLACE FUNCTION public.increment_megatalent_bracket_vote(
  p_match_id uuid,
  p_side text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_side = 'a' THEN
    UPDATE public.megatalent_bracket_matches
       SET votes_a = COALESCE(votes_a, 0) + 1
     WHERE id = p_match_id AND status = 'open';
  ELSIF p_side = 'b' THEN
    UPDATE public.megatalent_bracket_matches
       SET votes_b = COALESCE(votes_b, 0) + 1
     WHERE id = p_match_id AND status = 'open';
  ELSE
    RAISE EXCEPTION 'Invalid side: %', p_side;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_megatalent_bracket_vote(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_megatalent_bracket_vote(uuid, text) TO service_role;