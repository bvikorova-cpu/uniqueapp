-- Update test dating profiles to English
UPDATE dating_profiles 
SET 
  bio = CASE display_name
    WHEN 'Sofia' THEN 'Travel enthusiast and wine lover 🍷 Looking for someone to explore new places with.'
    WHEN 'Marek' THEN 'Outdoor enthusiast 🏔️ You''ll find me in the mountains on weekends. Looking for a partner for adventures.'
    WHEN 'Lucia' THEN 'Foodie and coffee lover ☕ Love trying new restaurants and baking desserts. Looking for someone with zest for life!'
    ELSE bio
  END,
  interests = CASE display_name
    WHEN 'Sofia' THEN ARRAY['travel', 'wine', 'reading', 'yoga']
    WHEN 'Marek' THEN ARRAY['hiking', 'skiing', 'photography', 'cooking']
    WHEN 'Lucia' THEN ARRAY['cooking', 'travel', 'coffee', 'dancing']
    ELSE interests
  END,
  location = CASE display_name
    WHEN 'Sofia' THEN 'Bratislava, Slovakia'
    WHEN 'Marek' THEN 'Košice, Slovakia'
    WHEN 'Lucia' THEN 'Žilina, Slovakia'
    ELSE location
  END
WHERE display_name IN ('Sofia', 'Marek', 'Lucia');