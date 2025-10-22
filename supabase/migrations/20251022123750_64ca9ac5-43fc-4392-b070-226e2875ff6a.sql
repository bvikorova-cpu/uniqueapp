-- Remove The Emperor's New Groove
DELETE FROM kids_shows WHERE id = 'ff5d380d-975a-444c-9601-1f0252ba5b2d';

-- Translate Slovak descriptions to English
UPDATE kids_shows SET description = 'A classic tale of beauty and the beast' WHERE id = '797a5906-8805-4364-aa04-80500b480654';
UPDATE kids_shows SET description = 'The magical story of Cinderella' WHERE id = 'a9245d7c-8816-48de-a62a-4bb17355063e';