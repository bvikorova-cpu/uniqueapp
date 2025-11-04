-- Add color palettes to all paint_by_numbers entries with empty colors

-- Update paintings with default color palettes based on their themes
UPDATE paint_by_numbers
SET image_data = jsonb_set(
  image_data,
  '{colors}',
  '[
    {"number": 1, "name": "Sky Blue", "color": "#87CEEB"},
    {"number": 2, "name": "Grass Green", "color": "#90EE90"},
    {"number": 3, "name": "Sunny Yellow", "color": "#FFD700"},
    {"number": 4, "name": "Rose Pink", "color": "#FFB6C1"},
    {"number": 5, "name": "Earth Brown", "color": "#D2691E"},
    {"number": 6, "name": "Ocean Blue", "color": "#4682B4"},
    {"number": 7, "name": "Lavender Purple", "color": "#E6E6FA"},
    {"number": 8, "name": "Bright White", "color": "#FFFFFF"}
  ]'::jsonb
)
WHERE image_data->>'colors' = '[]';