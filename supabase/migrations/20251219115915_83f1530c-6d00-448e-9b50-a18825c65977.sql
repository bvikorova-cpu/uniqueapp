-- Update more Slovak recipes to English (batch 3 - ingredients/instructions)
UPDATE recipes SET 
  ingredients = ARRAY['400g cooked chickpeas (1 can)', '60ml tahini (sesame paste)', '3 cloves garlic', '60ml fresh lemon juice', '60ml olive oil + extra for drizzling', '½ tsp cumin salt', '¼ tsp ground cumin', '80ml cold water', 'paprika for garnish'],
  instructions = ARRAY['Rinse and drain chickpeas thoroughly', 'Add tahini and lemon juice to blender, blend 1 minute', 'Add pressed garlic, cumin salt and cumin', 'Blend another 30 seconds', 'Add half the chickpeas and blend until smooth', 'Gradually add cold water while blending', 'Add remaining chickpeas and blend 1-2 minutes until creamy', 'If too thick, add more water', 'Taste and adjust salt or lemon juice as needed', 'Transfer to plate, create well and pour olive oil', 'Sprinkle with paprika and serve with pita or vegetables']
WHERE id = '4c401153-b724-425a-bea1-5b5716e4859a';

UPDATE recipes SET 
  ingredients = ARRAY['2 ripe avocados', '1 medium red onion', '1 large tomato', 'juice of 1 lime', '2 cloves garlic (pressed)', '1 small green chilli pepper', 'fresh coriander (30g)', '½ tsp cumin salt', '¼ tsp black pepper'],
  instructions = ARRAY['Halve avocados, remove pit and scoop out flesh', 'Place avocado in bowl and mash thoroughly with fork', 'Finely chop onion and add to avocado', 'Dice tomato into small cubes, remove seeds', 'Add tomatoes to avocado', 'Remove seeds from chilli and finely chop', 'Add chilli, pressed garlic and chopped coriander', 'Squeeze lime juice directly into mixture', 'Season with salt and pepper', 'Mix everything well', 'Serve with tortilla chips or as side for tacos']
WHERE id = '7cec4c54-401a-4b56-9f6d-42111f9b0dc3';

UPDATE recipes SET 
  ingredients = ARRAY['1kg fresh tomatoes (preferably San Marzano)', '1 large onion', '3 cloves garlic', '200ml cooking cream', '50g butter', '1 tbsp olive oil', 'fresh basil (15-20 leaves)', '1 tsp sugar', 'salt, black pepper', '500ml vegetable broth'],
  instructions = ARRAY['Blanch tomatoes in boiling water, peel and chop', 'Heat olive oil with butter in large pot', 'Finely chop onion and sauté 5 minutes until golden', 'Add pressed garlic and sauté another minute', 'Add tomatoes and sugar, stir', 'Cook 15 minutes on low heat, stirring occasionally', 'Add vegetable broth and cook 10 more minutes', 'Add most of basil (save some for garnish)', 'Blend soup with immersion blender until smooth', 'Return to heat, add cream and warm through (don''t boil)', 'Season with salt and pepper', 'Serve with fresh basil and croutons']
WHERE id = '4090e07e-97d2-4fe6-b879-32ec7359a8bb';

UPDATE recipes SET 
  ingredients = ARRAY['1 whole chicken (1.5-2kg)', '3 carrots', '2 parsnips', '1 celery root', '1 onion', '200g egg noodles', '3 bay leaves', '6 allspice berries', '5 black peppercorns', 'salt', 'fresh parsley for serving', '3 liters water'],
  instructions = ARRAY['Wash chicken thoroughly and place in large pot', 'Cover with 3 liters cold water and bring to boil', 'Skim foam that forms on surface', 'Clean vegetables and add whole to pot', 'Add bay leaves and spices', 'Cover and simmer 1.5 hours on low heat', 'Remove chicken and vegetables from broth', 'Strain broth through fine sieve', 'Pull meat from chicken and cut into pieces', 'Slice carrots into rounds', 'Season broth with salt', 'Add noodles and cook 8-10 minutes', 'Add meat and carrots, heat through', 'Serve sprinkled with fresh parsley']
WHERE id = '53f7fbc9-ad0c-4574-9095-80b2ef914991';

UPDATE recipes SET 
  ingredients = ARRAY['1.5kg pumpkin (hokkaido or butternut)', '1 large onion', '3 cloves garlic', '200ml cooking cream', '50g butter', '1 tbsp olive oil', '1 tsp ground ginger', '½ tsp nutmeg', '1 liter vegetable broth', 'salt, black pepper', 'pumpkin seeds for garnish', 'croutons for serving'],
  instructions = ARRAY['Peel and deseed pumpkin, cut into cubes', 'Heat olive oil with butter in large pot', 'Finely chop onion and sauté 5 minutes', 'Add pressed garlic and sauté 1 minute', 'Add pumpkin cubes, ginger and nutmeg', 'Stir and cook 3-4 minutes', 'Add vegetable broth and bring to boil', 'Cover and simmer 20-25 minutes until pumpkin is soft', 'Blend with immersion blender until smooth', 'Add cream and heat through', 'Season with salt and pepper', 'Serve topped with pumpkin seeds and croutons']
WHERE id = 'e55627d0-2d50-4145-8a93-90248435f3b7';

UPDATE recipes SET 
  ingredients = ARRAY['250g red or green lentils', '1 large onion', '2 carrots', '2 celery stalks', '3 cloves garlic', '1 can diced tomatoes (400g)', '1.5 liters vegetable broth', '2 tbsp olive oil', '1 tsp cumin', '½ tsp turmeric', 'juice of 1 lemon', 'salt, black pepper', 'fresh coriander for garnish'],
  instructions = ARRAY['Rinse lentils under cold water', 'Heat olive oil in large pot', 'Finely chop onion and sauté 5 minutes', 'Add diced carrots and celery, cook 3 minutes', 'Add pressed garlic, cumin and turmeric, stir', 'Add lentils, tomatoes and vegetable broth', 'Bring to boil, then reduce heat', 'Cover and simmer 25-30 minutes until lentils are soft', 'If too thick, add more broth', 'Season with salt, pepper and lemon juice', 'Blend partially or fully as desired', 'Serve garnished with fresh coriander']
WHERE id = '8e224617-2470-4206-bea8-f6cc6ba93005';