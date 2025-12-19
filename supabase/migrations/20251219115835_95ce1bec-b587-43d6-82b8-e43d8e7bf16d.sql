-- Update ingredients and instructions to English (batch 2)
UPDATE recipes SET 
  ingredients = ARRAY['1 baguette or ciabatta', '4 large ripe tomatoes', '3 cloves garlic', 'fresh basil (1 bunch)', '4 tbsp extra virgin olive oil', '1 tbsp balsamic vinegar', 'sea salt', 'black pepper', 'parmesan (optional)'],
  instructions = ARRAY['Preheat oven to 200°C', 'Slice baguette diagonally about 1-1.5cm thick', 'Place bread slices on baking sheet and drizzle with 2 tbsp olive oil', 'Toast in oven 5-7 minutes until golden, flip and toast other side', 'Meanwhile dice tomatoes into small cubes', 'Finely chop basil', 'Mix tomatoes, basil, 2 tbsp olive oil and balsamic vinegar in bowl', 'Season with salt and pepper', 'Cut garlic clove in half and rub on toasted bread', 'Top each slice with tomato mixture', 'Serve immediately to keep bread crispy']
WHERE id = '2a95e4d9-29a1-4366-a42d-26eeb7b45097';

UPDATE recipes SET 
  ingredients = ARRAY['matcha powder', 'milk', 'sugar', 'hot water'],
  instructions = ARRAY['Mix matcha', 'Add milk']
WHERE id = 'd3354b63-8027-4a1f-b29c-fee61ef50040';

UPDATE recipes SET 
  ingredients = ARRAY['2 salmon fillets (200g each)', '400g fresh broccoli', '3 cloves garlic', 'juice of 1 lemon', 'zest of 1 lemon', '4 tbsp olive oil', '2 tbsp butter', 'salt, black pepper', 'fresh dill', 'cherry tomatoes for garnish'],
  instructions = ARRAY['Preheat oven to 200°C', 'Pat salmon fillets dry with paper towel', 'Season with salt and pepper on both sides', 'Cut broccoli into florets', 'Heat 2 tbsp olive oil in pan', 'Sear salmon on one side 3-4 minutes', 'Flip and transfer to oven for 6-8 minutes', 'Meanwhile blanch broccoli in salted water 3 minutes', 'Drain and rinse with cold water', 'Heat butter with olive oil in pan', 'Add pressed garlic, cook 1 minute', 'Add broccoli, sauté 3 minutes', 'Season with salt, pepper and lemon juice', 'Serve salmon with broccoli', 'Garnish with lemon, dill and cherry tomatoes']
WHERE id = '68b332ba-042f-42ec-923f-0e8a619f8b3d';

UPDATE recipes SET 
  ingredients = ARRAY['2 ripe bananas', '250g strawberries', '200ml natural yogurt', '100ml milk', '2 tbsp honey', '1 tsp vanilla extract', '1 cup ice cubes', 'fresh mint for garnish'],
  instructions = ARRAY['Wash strawberries thoroughly and remove stems', 'Peel and slice bananas', 'Add bananas and strawberries to blender', 'Add yogurt and milk', 'Add honey and vanilla extract', 'Add ice cubes', 'Blend 30-45 seconds until smooth', 'If too thick, add more milk', 'Pour into glasses', 'Garnish with fresh strawberry and mint', 'Serve immediately']
WHERE id = '0caed6e0-1c71-4017-9242-53d5b3ecd11a';

UPDATE recipes SET 
  ingredients = ARRAY['200g quinoa', '1 cucumber', '250g cherry tomatoes', '1 ripe avocado', '1/2 red onion', 'juice of 2 limes', '4 tbsp olive oil', 'fresh mint (30g)', 'fresh coriander (30g)', 'salt, black pepper', '50g toasted seeds (sunflower, pumpkin)'],
  instructions = ARRAY['Rinse quinoa thoroughly under cold water', 'Cook in salted water 15 minutes until tender', 'Drain and let cool', 'Dice cucumber into small cubes', 'Halve cherry tomatoes', 'Dice avocado', 'Finely chop onion', 'Chop mint and coriander', 'Mix cooled quinoa with vegetables in bowl', 'Add herbs', 'Mix olive oil with lime juice', 'Pour dressing over salad', 'Season with salt and pepper', 'Top with toasted seeds before serving']
WHERE id = 'f863b742-7d28-4d95-99ad-f90a37b8875e';

UPDATE recipes SET 
  ingredients = ARRAY['pasta', 'basil', 'pine nuts', 'parmesan', 'garlic'],
  instructions = ARRAY['Cook pasta', 'Mix with pesto']
WHERE id = 'e12383c1-c830-4bc1-98fa-35da296e15ab';

UPDATE recipes SET 
  ingredients = ARRAY['penne pasta', 'tomatoes', 'garlic', 'chilli', 'olive oil'],
  instructions = ARRAY['Prepare sauce', 'Cook pasta', 'Mix together']
WHERE id = 'b835b967-46b5-43bb-af73-519980fb636d';

UPDATE recipes SET 
  ingredients = ARRAY['flour', 'sugar', 'eggs', 'milk', 'fruit'],
  instructions = ARRAY['Mix ingredients', 'Fill muffin tins', 'Bake']
WHERE id = '3d675728-3398-41b9-b194-ddf85b6a8382';

UPDATE recipes SET 
  ingredients = ARRAY['flour', 'milk', 'eggs', 'sugar', 'jam'],
  instructions = ARRAY['Mix batter', 'Fry', 'Serve with filling']
WHERE id = 'ee67377c-2bbf-45e0-8053-06008525a78b';

UPDATE recipes SET 
  ingredients = ARRAY['milk', 'sugar', 'starch', 'vanilla', 'egg'],
  instructions = ARRAY['Heat milk', 'Add starch', 'Chill']
WHERE id = 'de32470b-e967-4d78-81af-e3238725948c';