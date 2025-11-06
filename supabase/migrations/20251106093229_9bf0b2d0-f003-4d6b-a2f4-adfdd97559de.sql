-- Add foreign key relationship between skill_offerings and profiles
ALTER TABLE skill_offerings 
  DROP CONSTRAINT IF EXISTS skill_offerings_user_id_fkey;

ALTER TABLE skill_offerings 
  ADD CONSTRAINT skill_offerings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;