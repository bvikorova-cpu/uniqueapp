-- Remove duplicate rooms for Cinderella Castle (Walt Disney World)
-- Keep only the first created versions
DELETE FROM disney_castle_rooms
WHERE id IN (
  '610b1ec8-3c94-498b-b121-d8c07c83339c',
  'eeb5d5ba-d111-4f10-8b02-4976a39c262c',
  '4b97b978-9d4a-4e43-9a79-72342daf92aa',
  'cec4f7de-137e-42b1-97b5-7a76ac5bcdcd'
);