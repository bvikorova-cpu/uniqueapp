-- Remove duplicate RLS policies for dating_profiles
DROP POLICY IF EXISTS "Users can view all active profiles" ON dating_profiles;
DROP POLICY IF EXISTS "Subscribed users can view active profiles" ON dating_profiles;

-- Create single, clear policy for viewing active profiles
CREATE POLICY "Allow viewing active dating profiles" 
ON dating_profiles 
FOR SELECT 
USING (is_active = true);

-- Insert 3 test dating profiles with realistic data
INSERT INTO dating_profiles (
  user_id,
  display_name,
  bio,
  age,
  gender,
  looking_for,
  profile_photo_url,
  additional_photos,
  location,
  interests,
  is_active
) VALUES 
(
  gen_random_uuid(),
  'Sofia',
  'Milovníčka cestování a dobrého vína 🍷 Hľadám niekoho, s kým môžem spoznávať nové miesta.',
  28,
  'female',
  'male',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400'],
  'City',
  ARRAY['cestovanie', 'víno', 'čítanie', 'joga'],
  true
),
(
  gen_random_uuid(),
  'Marek',
  'Outdoorový nadšenec 🏔️ Cez víkend ma nájdete na horách. Hľadám partnerku na spoločné dobrodružstvá.',
  32,
  'male',
  'female',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'],
  'Košice',
  ARRAY['turistika', 'lyžovanie', 'fotografia', 'varenie'],
  true
),
(
  gen_random_uuid(),
  'Lucia',
  'Foodie a kavičkárka ☕ Milujem skúšať nové reštaurácie a piecť dezerty. Hľadám niekoho s chuťou do života!',
  26,
  'female',
  'male',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  ARRAY['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'],
  'Žilina',
  ARRAY['varenie', 'cestovanie', 'káva', 'tanec'],
  true
);