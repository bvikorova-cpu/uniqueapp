DO $$
DECLARE t text;
DECLARE user_scoped text[] := ARRAY[
  'mentor_360_requests','mentor_360_responses','mentor_action_plans','mentor_cbt_progress',
  'mentor_checkins','mentor_conversation_memory','mentor_daily_nudges','mentor_goals',
  'mentor_habit_logs','mentor_habits','mentor_moods','mentor_personality_assessments',
  'mentor_premium_subs','mentor_progress','mentor_roleplay_sessions','mentor_session_summaries',
  'mentor_sessions','mentor_smart_goals','mentor_smart_milestones','mentor_subscriptions',
  'mentor_user_skill_progress','mentor_voice_journals','mentor_xp'
];
DECLARE public_read text[] := ARRAY[
  'mentor_cbt_programs','mentor_coach_personalities','mentor_reflection_prompts',
  'mentor_roleplay_scenarios','mentor_skills'
];
BEGIN
  FOREACH t IN ARRAY user_scoped LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
  FOREACH t IN ARRAY public_read LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- Also grant on mentor_smart_milestones responses tokens table for the anonymous 360 submit path
GRANT SELECT ON public.mentor_360_requests TO anon;
GRANT INSERT ON public.mentor_360_responses TO anon;