-- TEST DATA for MegaTalent tier comparison
-- LABEL: test_data - DELETE LATER
-- Using real user: 3c23b29d-c9e2-4495-8772-143464d08486

-- First, create/update TOP Premium subscription for this user
INSERT INTO megatalent_subscriptions (id, user_id, tier, price, status, bonus_votes, win_chance_boost, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '3c23b29d-c9e2-4495-8772-143464d08486',
  'top_premium',
  15,
  'active',
  100000,
  50,
  now()
)
ON CONFLICT (user_id) DO UPDATE SET 
  tier = 'top_premium',
  price = 15,
  status = 'active',
  bonus_votes = 100000,
  win_chance_boost = 50;

-- Insert TEST submission #1 - TOP Premium (Drawing category)
-- This will show the gold badge and +100k bonus votes
INSERT INTO talent_submissions (id, user_id, title, description, category, media_url, votes_count, is_active, created_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '3c23b29d-c9e2-4495-8772-143464d08486',
  '[TEST] TOP Premium - Digital Portrait 🏆',
  '[TEST DATA - DELETE LATER] TOP Premium user submission. Displays: Gold badge ✓ | +100,000 bonus votes ✓ | 50% ranking boost ✓ | Base votes: 5,000 → Total display: 105,000',
  'drawing',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
  5000,
  true,
  now()
);

-- Insert TEST submission #2 - Simulated Standard Premium (Drawing category)
INSERT INTO talent_submissions (id, user_id, title, description, category, media_url, votes_count, is_active, created_at)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '3c23b29d-c9e2-4495-8772-143464d08486',
  '[TEST] Standard Premium - Watercolor 📋',
  '[TEST DATA - DELETE LATER] Standard Premium comparison (simulated). No gold badge | No bonus votes | No ranking boost | Votes: 4,500',
  'drawing',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
  4500,
  true,
  now()
);