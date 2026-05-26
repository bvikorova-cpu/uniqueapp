
-- A) Credits for Beata
INSERT INTO public.tutoring_credits (user_id, credits_remaining, total_credits_purchased)
VALUES ('a8f98c5c-3ce8-4928-bfaf-061a700411c6', 50, 50)
ON CONFLICT (user_id) DO UPDATE SET credits_remaining = public.tutoring_credits.credits_remaining + 50;

-- B1) Daily Challenge for today
INSERT INTO public.education_daily_challenges (challenge_date, type, payload, xp_reward)
VALUES (
  CURRENT_DATE,
  'quiz',
  '{"questions":[
    {"question":"What is the capital of France?","options":["London","Paris","Berlin","Madrid"],"correct_answer":"Paris"},
    {"question":"What is 7 × 8?","options":["54","56","64","48"],"correct_answer":"56"},
    {"question":"Which planet is known as the Red Planet?","options":["Venus","Jupiter","Mars","Saturn"],"correct_answer":"Mars"},
    {"question":"Who wrote Romeo and Juliet?","options":["Dickens","Shakespeare","Austen","Tolkien"],"correct_answer":"Shakespeare"},
    {"question":"What is the chemical symbol for gold?","options":["Go","Gd","Au","Ag"],"correct_answer":"Au"}
  ]}'::jsonb,
  50
)
ON CONFLICT DO NOTHING;

-- B2) Skill tree seeds
INSERT INTO public.education_skill_tree_nodes (subject, title, description, required_xp, order_index, icon) VALUES
('math','Arithmetic Basics','Addition, subtraction, multiplication, division',0,1,'Calculator'),
('math','Fractions & Decimals','Working with parts of a whole',100,2,'Divide'),
('math','Algebra I','Variables and equations',250,3,'Sigma'),
('math','Geometry','Shapes, angles, and area',500,4,'Triangle'),
('math','Trigonometry','Sin, cos, tan and beyond',1000,5,'Waves'),
('math','Calculus Intro','Limits and derivatives',2000,6,'TrendingUp'),
('science','Scientific Method','How science works',0,1,'Microscope'),
('science','Biology Basics','Cells, life, ecosystems',100,2,'Leaf'),
('science','Chemistry Foundations','Atoms, molecules, reactions',250,3,'FlaskConical'),
('science','Physics I','Motion, forces, energy',500,4,'Atom'),
('science','Earth & Space','Geology and astronomy',1000,5,'Globe'),
('science','Advanced Topics','Quantum, genetics, climate',2000,6,'Telescope'),
('languages','Alphabet & Sounds','Start with the basics',0,1,'Languages'),
('languages','Common Words','100 most useful words',100,2,'BookOpen'),
('languages','Simple Sentences','Build your first phrases',250,3,'MessageCircle'),
('languages','Grammar Rules','Tenses and structure',500,4,'BookText'),
('languages','Conversations','Hold a real dialogue',1000,5,'Users'),
('languages','Fluency','Think in the language',2000,6,'Sparkles');
