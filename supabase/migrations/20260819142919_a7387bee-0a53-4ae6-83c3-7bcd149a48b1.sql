REVOKE EXECUTE ON FUNCTION public.get_quiz_questions_public(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_quiz_questions_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_public(uuid) TO authenticated;