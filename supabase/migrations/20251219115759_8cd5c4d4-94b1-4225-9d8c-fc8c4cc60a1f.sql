-- Update ingredients and instructions to English (batch 1)
UPDATE recipes SET 
  ingredients = ARRAY['1 baguette', '100g butter', '4 cloves garlic', 'parsley'],
  instructions = ARRAY['Mix butter with garlic', 'Spread on bread', 'Bake in oven']
WHERE id = 'd2834845-c9fa-46e7-8a61-3f8c0e990432';

UPDATE recipes SET 
  ingredients = ARRAY['yogurt', '1 cucumber', 'garlic', 'olive oil', 'dill'],
  instructions = ARRAY['Grate cucumber', 'Mix with yogurt and garlic']
WHERE id = '1abb3dbf-a0f2-4256-ac61-96af005b8511';

UPDATE recipes SET 
  ingredients = ARRAY['cabbage', 'carrot', 'sesame oil', 'soy sauce', 'sesame seeds'],
  instructions = ARRAY['Shred vegetables', 'Add Asian dressing']
WHERE id = '7a3c402d-8b0c-4421-92a6-54adc99d387a';

UPDATE recipes SET 
  ingredients = ARRAY['mixed greens', 'feta cheese', 'olives', 'cucumber', 'olive oil'],
  instructions = ARRAY['Mix salad greens', 'Add feta', 'Drizzle with dressing']
WHERE id = '5169abf5-aa08-4861-9db3-53e94218a916';

UPDATE recipes SET 
  ingredients = ARRAY['mixed greens', 'radish', 'cucumber', 'spring onion', 'balsamic vinegar'],
  instructions = ARRAY['Chop vegetables', 'Mix with greens', 'Drizzle with dressing']
WHERE id = '7a1c3203-e7e0-4054-a43a-97ce81d85565';

UPDATE recipes SET 
  ingredients = ARRAY['300g fresh buffalo mozzarella', '4 large ripe tomatoes', 'fresh basil (1 bunch)', '4 tbsp extra virgin olive oil', '2 tbsp balsamic vinegar', 'sea salt', 'freshly ground black pepper'],
  instructions = ARRAY['Drain mozzarella and slice about 1cm thick', 'Slice tomatoes to same thickness', 'Arrange tomato and mozzarella slices alternately on serving plate', 'Insert fresh basil leaves between slices', 'Drizzle with olive oil', 'Add a few drops of balsamic vinegar', 'Season with sea salt and freshly ground black pepper', 'Let rest 10 minutes at room temperature before serving', 'Serve with fresh baguette']
WHERE id = '6adcb2ff-bbe2-4911-9d4f-cceb4f92d457';

UPDATE recipes SET 
  ingredients = ARRAY['4 large ripe tomatoes', '1 cucumber', '200g feta cheese', '150g black Kalamata olives', '1 red onion', '1 green pepper', '4 tbsp extra virgin olive oil', '1 tbsp red wine vinegar', '1 tsp dried oregano', 'salt, black pepper'],
  instructions = ARRAY['Cut tomatoes into larger chunks', 'Peel cucumber in strips and slice thickly', 'Cut pepper into strips', 'Slice onion into thin crescents', 'Leave olives whole or halve them', 'Mix chopped vegetables in a bowl', 'Cut feta into thick cubes', 'Add feta to vegetables', 'Mix olive oil and vinegar in small bowl', 'Add oregano, salt and pepper to dressing', 'Pour dressing over salad', 'Gently mix', 'Let rest 10 minutes before serving']
WHERE id = '8ad11a69-f90f-46b9-a07a-67f2122ec9e1';

UPDATE recipes SET 
  ingredients = ARRAY['600g chicken breast', '2 heads romaine lettuce', '100g parmesan', '150g croutons', '3 cloves garlic', '2 anchovies in oil', '2 egg yolks', '150ml olive oil', '2 tbsp lemon juice', '1 tsp Worcestershire sauce', '1 tsp Dijon mustard', 'salt, black pepper'],
  instructions = ARRAY['Season chicken with salt and pepper, pan-fry 6-7 minutes each side', 'Let chicken cool and slice', 'Make dressing: blend anchovies, garlic, egg yolks and mustard', 'While blending, slowly drizzle in olive oil', 'Add lemon juice, Worcestershire sauce, season with salt and pepper', 'Wash romaine lettuce thoroughly and tear into smaller pieces', 'Dry lettuce in spinner or with towel', 'Mix lettuce with dressing in bowl', 'Add chicken and croutons', 'Add grated parmesan', 'Gently mix and serve immediately']
WHERE id = '70900579-978c-4639-9a0d-b5c7ba99c047';

UPDATE recipes SET 
  ingredients = ARRAY['flour', 'sugar', 'eggs', 'milk', 'cocoa'],
  instructions = ARRAY['Mix ingredients', 'Pour into baking pan', 'Bake']
WHERE id = '72825f74-0517-4dd4-af68-e28414d04d24';

UPDATE recipes SET 
  ingredients = ARRAY['flour', 'honey', 'spices', 'eggs', 'sugar'],
  instructions = ARRAY['Mix dough', 'Pour into pan', 'Bake']
WHERE id = '785ded19-164b-4c70-89f0-f84fab570a5d';