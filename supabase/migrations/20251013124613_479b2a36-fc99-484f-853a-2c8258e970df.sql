-- Translate all badges to English

-- First, delete duplicate badges (keep only the first set)
DELETE FROM badges 
WHERE created_at > '2025-10-11 17:40:00+00';

-- Update remaining badges to English
UPDATE badges 
SET name = 'Beginner',
    description = 'Created your first post'
WHERE name = 'Nováčik';

UPDATE badges 
SET name = 'Active',
    description = 'Created 10 posts'
WHERE name = 'Aktívny';

UPDATE badges 
SET name = 'Influencer',
    description = 'Created 50 posts'
WHERE name = 'Influencer';

UPDATE badges 
SET name = 'Commentator',
    description = 'Wrote 50 comments'
WHERE name = 'Komentátor';

UPDATE badges 
SET name = 'Video King',
    description = 'Shared 10 videos'
WHERE name = 'Videokráľ';

UPDATE badges 
SET name = 'Friendly',
    description = 'Have 10 friends'
WHERE name = 'Priateľský';

UPDATE badges 
SET name = 'Popular',
    description = 'Received 100 likes'
WHERE name = 'Populárny';

UPDATE badges 
SET name = 'Streaker',
    description = '7-day login streak'
WHERE name = 'Streaker';

UPDATE badges 
SET name = 'Monthly Warrior',
    description = '30-day login streak'
WHERE name = 'Mesačný bojovník';