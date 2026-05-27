INSERT INTO public.education_daily_challenges (challenge_date, type, payload, xp_reward)
VALUES (
  CURRENT_DATE,
  'quiz',
  '{"questions":[
    {"question":"What is the capital of France?","options":["London","Berlin","Paris","Madrid"],"correct_answer":"Paris","explanation":"Paris has been the capital of France since 987 AD."},
    {"question":"What is 7 × 8?","options":["54","56","62","64"],"correct_answer":"56","explanation":"7 × 8 = 56."},
    {"question":"Which planet is known as the Red Planet?","options":["Venus","Mars","Jupiter","Saturn"],"correct_answer":"Mars","explanation":"Mars appears red due to iron oxide on its surface."},
    {"question":"Who wrote Romeo and Juliet?","options":["Charles Dickens","Mark Twain","William Shakespeare","Jane Austen"],"correct_answer":"William Shakespeare","explanation":"Shakespeare wrote it around 1595."},
    {"question":"What is the chemical symbol for gold?","options":["Go","Gd","Au","Ag"],"correct_answer":"Au","explanation":"Au comes from the Latin aurum."}
  ]}'::jsonb,
  50
)
ON CONFLICT (challenge_date) DO UPDATE SET payload = EXCLUDED.payload;