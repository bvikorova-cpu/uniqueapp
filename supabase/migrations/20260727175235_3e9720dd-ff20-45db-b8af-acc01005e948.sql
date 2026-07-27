GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_flashcard_decks TO authenticated;
GRANT SELECT ON public.education_flashcard_decks TO anon;
GRANT ALL ON public.education_flashcard_decks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_flashcards TO authenticated;
GRANT SELECT ON public.education_flashcards TO anon;
GRANT ALL ON public.education_flashcards TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_srs_state TO authenticated;
GRANT ALL ON public.education_srs_state TO service_role;

GRANT SELECT ON public.education_achievements TO anon, authenticated;
GRANT ALL ON public.education_achievements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_user_achievements TO authenticated;
GRANT ALL ON public.education_user_achievements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_daily_challenges TO authenticated;
GRANT SELECT ON public.education_daily_challenges TO anon;
GRANT ALL ON public.education_daily_challenges TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_daily_completions TO authenticated;
GRANT ALL ON public.education_daily_completions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_weekly_leagues TO authenticated;
GRANT SELECT ON public.education_weekly_leagues TO anon;
GRANT ALL ON public.education_weekly_leagues TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_certificates TO authenticated;
GRANT SELECT ON public.education_certificates TO anon;
GRANT ALL ON public.education_certificates TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_math_solves TO authenticated;
GRANT ALL ON public.education_math_solves TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_notes TO authenticated;
GRANT ALL ON public.education_notes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_study_groups TO authenticated;
GRANT SELECT ON public.education_study_groups TO anon;
GRANT ALL ON public.education_study_groups TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_study_group_members TO authenticated;
GRANT ALL ON public.education_study_group_members TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_lesson_progress TO authenticated;
GRANT ALL ON public.education_lesson_progress TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_exercise_submissions TO authenticated;
GRANT ALL ON public.education_exercise_submissions TO service_role;