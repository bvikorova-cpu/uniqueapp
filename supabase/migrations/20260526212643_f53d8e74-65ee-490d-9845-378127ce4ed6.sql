
UPDATE public.education_daily_challenges
SET payload = '{"questions":[
  {"question":"What is the capital of France?","options":["London","Paris","Berlin","Madrid"],"correct_answer":"Paris"},
  {"question":"What is 7 × 8?","options":["54","56","64","48"],"correct_answer":"56"},
  {"question":"Which planet is known as the Red Planet?","options":["Venus","Jupiter","Mars","Saturn"],"correct_answer":"Mars"},
  {"question":"Who wrote Romeo and Juliet?","options":["Dickens","Shakespeare","Austen","Tolkien"],"correct_answer":"Shakespeare"},
  {"question":"What is the chemical symbol for gold?","options":["Go","Gd","Au","Ag"],"correct_answer":"Au"}
]}'::jsonb
WHERE challenge_date = CURRENT_DATE;
