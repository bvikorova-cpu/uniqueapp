-- Seed data for medical campaigns
INSERT INTO public.medical_campaigns (user_id, title, description, story, patient_name, diagnosis, hospital, target_amount, current_amount, status, verified, monthly_donors_count, one_time_donors_count, ends_at)
VALUES 
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Heart Surgery for Little Emma', 'Help 5-year-old Emma get life-saving heart surgery', 'Emma was born with a congenital heart defect that has progressively worsened. Her family has exhausted all local treatment options and she now requires specialized surgery at a leading cardiac center abroad.', 'Emma Johnson', 'Congenital Heart Disease', 'St. Mary Cardiac Hospital', 50000, 15000, 'active', true, 25, 120, NOW() + INTERVAL '60 days'),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Cancer Treatment for David', 'Urgent chemotherapy needed for stage 3 cancer patient', 'David, 42, was recently diagnosed with stage 3 colon cancer. He needs immediate chemotherapy treatment but his insurance doesn''t cover the full cost of the specialized treatment plan recommended by his oncologist.', 'David Martinez', 'Stage 3 Colon Cancer', 'City General Hospital', 35000, 8500, 'active', true, 18, 95, NOW() + INTERVAL '45 days');

-- Seed data for dream campaigns  
INSERT INTO public.dream_campaigns (user_id, title, description, story, dream_type, target_amount, current_amount, status, supporters_count)
VALUES
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Art School in Paris', 'Help me study art at École des Beaux-Arts', 'Ever since I was young, I''ve dreamed of studying art in Paris. I''ve been accepted to École des Beaux-Arts, one of the most prestigious art schools in the world, but I need help covering tuition and living expenses.', 'education', 15000, 3500, 'active', 42),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Launch My Sustainable Fashion Brand', 'Eco-friendly clothing line startup funding', 'I want to create a sustainable fashion brand that uses only recycled and organic materials. I have the designs, the suppliers, and the business plan - I just need initial capital for the first production run.', 'startup', 25000, 7200, 'active', 68);

-- Seed data for hero campaigns
INSERT INTO public.hero_campaigns (user_id, title, description, story, hero_type, organization_name, target_amount, current_amount, status, verified, supporters_count)
VALUES
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'New Van for Community Food Bank', 'Maria needs a van to feed 200+ families weekly', 'Maria volunteers at our local food bank every single day, distributing food to over 200 families in need. Her old van broke down and she urgently needs a replacement to continue her vital work in the community.', 'volunteer', 'Community Food Bank Alliance', 8000, 2100, 'active', true, 65),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Equipment for Volunteer Fire Brigade', 'Critical safety equipment for rural firefighters', 'Our volunteer fire brigade serves 5 rural communities but lacks modern safety equipment. We need new protective gear, breathing apparatus, and communication devices to keep our volunteer firefighters safe.', 'firefighter', 'Valley Volunteer Fire Department', 12000, 4800, 'active', true, 89);

-- Seed data for pet rescue campaigns
INSERT INTO public.pet_rescue_campaigns (user_id, pet_name, pet_type, title, description, story, medical_condition, shelter_name, target_amount, current_amount, status, urgent, supporters_count)
VALUES
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Max', 'dog', 'Emergency Surgery for Max', 'Max was hit by a car and needs urgent leg surgery', 'Max, a 3-year-old rescue dog, was hit by a car while escaping from his yard. He has a badly broken leg that requires immediate surgery or he may lose the leg entirely. His family cannot afford the €2,500 surgery cost.', 'Broken leg requiring orthopedic surgery', 'City Animal Rescue', 2500, 890, 'active', true, 34),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Luna', 'cat', 'Kidney Treatment for Luna', 'Luna needs ongoing treatment for kidney disease', 'Luna is a 7-year-old cat suffering from chronic kidney disease. She requires special medication and regular vet visits to maintain her quality of life. Her owner is elderly and on a fixed income.', 'Chronic kidney disease', 'Feline Friends Shelter', 1800, 620, 'active', false, 28);

-- Seed data for student campaigns
INSERT INTO public.student_campaigns (user_id, title, description, story, support_type, school_name, field_of_study, target_amount, current_amount, status, supporters_count, pay_it_forward)
VALUES
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Final Year at MIT', 'First-generation student needs help with tuition', 'I''m a first-generation college student in my final year at MIT studying Computer Science. My family has sacrificed everything to help me get this far, but we''re struggling to cover the last year''s tuition. I''ve maintained a 3.9 GPA and have a job offer waiting after graduation.', 'tuition', 'Massachusetts Institute of Technology', 'Computer Science', 12000, 4200, 'active', 58, true),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Medical Equipment for Nursing School', 'Essential equipment for nursing certification', 'I''m training to become a nurse but need to purchase required medical equipment and supplies for my clinical rotations. This includes stethoscope, blood pressure cuff, medical scissors, and other essential tools.', 'equipment', 'State University Nursing Program', 'Nursing', 800, 340, 'active', 22, true);

-- Seed data for crisis campaigns
INSERT INTO public.crisis_campaigns (user_id, title, description, story, crisis_type, location, target_amount, current_amount, status, verified, urgent, supporters_count, expires_at)
VALUES
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Flood Relief for Springfield', 'Severe flooding has displaced 500 families', 'A devastating flood has hit Springfield, leaving 500 families homeless. They urgently need shelter, food, clean water, and medical supplies. Local emergency services are overwhelmed and immediate aid is critical.', 'flood', 'Springfield, County Valley', 100000, 35000, 'active', true, true, 425, NOW() + INTERVAL '30 days'),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'House Fire Recovery Fund', 'Family of 6 lost everything in house fire', 'The Johnson family lost their home and all possessions in a devastating house fire last week. Parents and 4 children (ages 3-12) escaped safely but have nothing left. They need help with temporary housing, clothing, school supplies, and rebuilding their lives.', 'fire', 'Oak Grove, Riverside District', 15000, 6200, 'active', true, true, 178, NOW() + INTERVAL '45 days');

-- Seed data for talent campaigns
INSERT INTO public.talent_campaigns (user_id, title, description, story, talent_type, portfolio_url, target_amount, current_amount, status, sponsors_count, premium_subscriber)
VALUES
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'First Album Recording', 'Help me record my debut album with pro producers', 'I''ve been writing and performing music for 10 years. I''ve built a loyal following of 50k on social media and have been offered a distribution deal - but only if I can professionally record my album. I need funding for studio time, producers, and session musicians.', 'music', 'https://soundcloud.com/alexturner', 8000, 2400, 'active', 78, true),
  ('3c23b29d-c9e2-4495-8772-143464d08486', 'Olympic Training Support', 'Young gymnast training for 2028 Olympics', 'Sofia is a 16-year-old gymnast who has been identified as a potential Olympic athlete. She needs funding for specialized coaching, training facilities, competition travel, and equipment to pursue her Olympic dreams.', 'sports', 'https://instagram.com/sofia_gymnastics', 20000, 5600, 'active', 124, true);