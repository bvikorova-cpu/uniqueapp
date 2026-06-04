
-- Widen action_type check
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_action_type_check;
ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_action_type_check
  CHECK (action_type = ANY (ARRAY[
    'post','comment','reaction','story','share',
    'job_application','job_tool_use','job_company_follow','job_country_apply'
  ]));

INSERT INTO public.challenges (slug, title, description, icon, challenge_type, action_type, target_count, xp_reward, active)
VALUES
  ('weekly_speed_applicant', 'Speed Applicant', 'Apply to 5 jobs this week', '⚡', 'weekly', 'job_application', 5, 150, true),
  ('weekly_tool_sharpener', 'Skill Sharpener', 'Use 2 different AI career tools', '🛠️', 'weekly', 'job_tool_use', 2, 100, true),
  ('weekly_network_builder', 'Network Builder', 'Follow 3 companies this week', '🤝', 'weekly', 'job_company_follow', 3, 120, true),
  ('weekly_global_reach', 'Global Reach', 'Apply to jobs in 2 countries', '🌍', 'weekly', 'job_country_apply', 2, 180, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.achievements (code, name, description, icon, points)
VALUES
  ('job_first_application', 'First Application', 'Submit your first job application', '🎯', 10),
  ('job_active_applicant', 'Active Applicant', 'Submit 5 job applications', '📝', 25),
  ('job_persistent', 'Persistent Hunter', 'Submit 10 job applications', '💼', 40),
  ('job_marathon', 'Application Marathon', 'Submit 25 job applications', '🏃', 75),
  ('job_streak_3', 'Consistent Starter', 'Maintain a 3-day application streak', '🔥', 15),
  ('job_streak_7', '7-Day Streak', 'Maintain a 7-day application streak', '⭐', 35),
  ('job_streak_30', '30-Day Champion', 'Maintain a 30-day application streak', '👑', 100),
  ('job_tools_resume', 'Resume Master', 'Use AI Resume Builder', '📄', 20),
  ('job_tools_interview', 'Interview Ready', 'Use AI Interview Coach', '🎤', 20),
  ('job_tools_salary', 'Salary Expert', 'Use AI Salary Negotiator', '💰', 25),
  ('job_tools_career', 'Career Navigator', 'Use AI Career Path Planner', '🗺️', 20),
  ('job_top_candidate', 'Top Candidate', 'Reach top 10 of the skill leaderboard', '🏆', 60)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_user_job_achievements()
RETURNS TABLE (
  code text,
  name text,
  description text,
  icon text,
  points integer,
  unlocked boolean,
  progress integer,
  target integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _apps integer := 0;
  _longest integer := 0;
  _resume integer := 0;
  _interview integer := 0;
  _salary integer := 0;
  _career integer := 0;
  _leaderboard_rank integer := 9999;
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO _apps FROM public.job_applications WHERE applicant_id = _uid;

  SELECT COALESCE(s.longest_streak, 0) INTO _longest
    FROM public.user_job_streaks s WHERE s.user_id = _uid;
  _longest := COALESCE(_longest, 0);

  SELECT COUNT(*) INTO _resume    FROM public.ai_usage_history WHERE user_id = _uid AND usage_type = 'resume_builder';
  SELECT COUNT(*) INTO _interview FROM public.ai_usage_history WHERE user_id = _uid AND usage_type = 'interview_coach';
  SELECT COUNT(*) INTO _salary    FROM public.ai_usage_history WHERE user_id = _uid AND usage_type = 'salary_negotiator';
  SELECT COUNT(*) INTO _career    FROM public.ai_usage_history WHERE user_id = _uid AND usage_type = 'career_path';

  SELECT rnk INTO _leaderboard_rank FROM (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY xp DESC) AS rnk
    FROM public.hub_xp WHERE hub = 'jobs'
  ) r WHERE user_id = _uid;
  _leaderboard_rank := COALESCE(_leaderboard_rank, 9999);

  RETURN QUERY
  SELECT a.code, a.name, a.description, a.icon, a.points,
         (CASE a.code
            WHEN 'job_first_application' THEN _apps >= 1
            WHEN 'job_active_applicant'  THEN _apps >= 5
            WHEN 'job_persistent'        THEN _apps >= 10
            WHEN 'job_marathon'          THEN _apps >= 25
            WHEN 'job_streak_3'          THEN _longest >= 3
            WHEN 'job_streak_7'          THEN _longest >= 7
            WHEN 'job_streak_30'         THEN _longest >= 30
            WHEN 'job_tools_resume'      THEN _resume >= 1
            WHEN 'job_tools_interview'   THEN _interview >= 1
            WHEN 'job_tools_salary'      THEN _salary >= 1
            WHEN 'job_tools_career'      THEN _career >= 1
            WHEN 'job_top_candidate'     THEN _leaderboard_rank <= 10
            ELSE false
          END) AS unlocked,
         (CASE a.code
            WHEN 'job_first_application' THEN LEAST(_apps, 1)
            WHEN 'job_active_applicant'  THEN LEAST(_apps, 5)
            WHEN 'job_persistent'        THEN LEAST(_apps, 10)
            WHEN 'job_marathon'          THEN LEAST(_apps, 25)
            WHEN 'job_streak_3'          THEN LEAST(_longest, 3)
            WHEN 'job_streak_7'          THEN LEAST(_longest, 7)
            WHEN 'job_streak_30'         THEN LEAST(_longest, 30)
            WHEN 'job_tools_resume'      THEN LEAST(_resume, 1)
            WHEN 'job_tools_interview'   THEN LEAST(_interview, 1)
            WHEN 'job_tools_salary'      THEN LEAST(_salary, 1)
            WHEN 'job_tools_career'      THEN LEAST(_career, 1)
            WHEN 'job_top_candidate'     THEN CASE WHEN _leaderboard_rank <= 10 THEN 1 ELSE 0 END
            ELSE 0
          END) AS progress,
         (CASE a.code
            WHEN 'job_first_application' THEN 1
            WHEN 'job_active_applicant'  THEN 5
            WHEN 'job_persistent'        THEN 10
            WHEN 'job_marathon'          THEN 25
            WHEN 'job_streak_3'          THEN 3
            WHEN 'job_streak_7'          THEN 7
            WHEN 'job_streak_30'         THEN 30
            ELSE 1
          END) AS target
  FROM public.achievements a
  WHERE a.code LIKE 'job_%'
  ORDER BY a.code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_job_achievements() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_job_challenges_hall_of_fame()
RETURNS TABLE (
  challenge_slug text,
  challenge_title text,
  xp_reward integer,
  total_completions bigint,
  top_user_id uuid,
  top_user_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH job_ch AS (
    SELECT id, slug, title, xp_reward
    FROM public.challenges
    WHERE action_type LIKE 'job_%'
  ),
  comps AS (
    SELECT ucp.challenge_id, COUNT(*)::bigint AS total
    FROM public.user_challenge_progress ucp
    JOIN job_ch c ON c.id = ucp.challenge_id
    WHERE ucp.completed_at IS NOT NULL
    GROUP BY ucp.challenge_id
  ),
  top_users AS (
    SELECT DISTINCT ON (ucp.challenge_id)
      ucp.challenge_id,
      ucp.user_id,
      p.full_name
    FROM public.user_challenge_progress ucp
    JOIN job_ch c ON c.id = ucp.challenge_id
    LEFT JOIN public.profiles p ON p.id = ucp.user_id
    WHERE ucp.completed_at IS NOT NULL
    ORDER BY ucp.challenge_id, ucp.completed_at ASC
  )
  SELECT c.slug, c.title, c.xp_reward,
         COALESCE(co.total, 0) AS total_completions,
         tu.user_id,
         COALESCE(tu.full_name, 'Anonymous')
  FROM job_ch c
  LEFT JOIN comps co ON co.challenge_id = c.id
  LEFT JOIN top_users tu ON tu.challenge_id = c.id
  ORDER BY total_completions DESC, c.slug
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.get_job_challenges_hall_of_fame() TO authenticated, anon;
