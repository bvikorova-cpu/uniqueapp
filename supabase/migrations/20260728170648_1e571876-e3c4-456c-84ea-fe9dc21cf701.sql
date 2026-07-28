ALTER VIEW public.brain_duel_questions_public SET (security_invoker = false);
ALTER VIEW public.iq_test_questions_public SET (security_invoker = false);

GRANT SELECT ON public.brain_duel_questions_public TO authenticated;
GRANT SELECT ON public.iq_test_questions_public TO authenticated;

CREATE OR REPLACE FUNCTION public.brain_duel_fifty_fifty(_question_id uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _correct text;
  _wrong text[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(correct_answer) INTO _correct
  FROM public.brain_duel_questions
  WHERE id = _question_id;

  IF _correct IS NULL THEN
    _correct := 'a';
  END IF;

  SELECT array_agg(o) INTO _wrong
  FROM (
    SELECT o FROM unnest(ARRAY['a','b','c','d']) AS o
    WHERE o <> _correct
    ORDER BY random()
    LIMIT 2
  ) s;

  RETURN coalesce(_wrong, ARRAY[]::text[]);
END;
$$;

REVOKE ALL ON FUNCTION public.brain_duel_fifty_fifty(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.brain_duel_fifty_fifty(uuid) TO authenticated;