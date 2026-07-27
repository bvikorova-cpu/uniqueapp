GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_study_groups TO authenticated;
GRANT ALL ON public.education_study_groups TO service_role;
GRANT SELECT ON public.education_study_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_study_group_members TO authenticated;
GRANT ALL ON public.education_study_group_members TO service_role;