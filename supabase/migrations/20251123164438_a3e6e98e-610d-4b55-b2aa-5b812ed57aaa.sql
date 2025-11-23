-- Fix Premium Championship description to be fully in English
UPDATE iq_competitions 
SET description = 'Elite monthly championship - 90-minute expert test with massive prize pool'
WHERE title = 'Premium Championship';