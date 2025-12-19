-- Update Ramen with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Prepare the broth: Roast 2 lbs pork bones at 400°F for 30 minutes until browned.',
  '2. Transfer bones to large pot, add 12 cups water, 1 onion halved, 6 garlic cloves, 2-inch ginger piece.',
  '3. Bring to boil, reduce heat, simmer 4-6 hours, skimming foam occasionally. Strain broth.',
  '4. Season broth with 3 tbsp soy sauce, 2 tbsp mirin, 1 tsp sesame oil. Keep warm.',
  '5. Prepare chashu pork: Roll 1 lb pork belly, tie with string. Sear all sides in hot pan.',
  '6. Braise in mixture of 1 cup soy sauce, 1/2 cup sake, 1/2 cup mirin, 2 tbsp sugar for 2-3 hours until tender.',
  '7. Slice chashu into 1/4-inch rounds when ready to serve.',
  '8. Soft boil eggs: Lower 4 eggs into boiling water, cook 6.5 minutes for runny yolk. Ice bath immediately.',
  '9. Marinate peeled eggs in leftover chashu braising liquid for at least 2 hours.',
  '10. Cook ramen noodles according to package (usually 2-3 minutes). Drain well.',
  '11. To assemble: Place hot noodles in bowl, ladle hot broth over noodles.',
  '12. Top with sliced chashu, halved marinated egg, sliced green onions, nori sheets, and corn.',
  '13. Drizzle with chili oil if desired. Serve immediately while piping hot.'
] WHERE title = 'Ramen';

-- Update Bruschetta with detailed instructions  
UPDATE recipes SET instructions = ARRAY[
  '1. Preheat oven to 400°F (200°C) or heat grill pan.',
  '2. Dice 4 ripe Roma tomatoes into small cubes. Place in bowl.',
  '3. Finely mince 3 cloves fresh garlic.',
  '4. Chiffonade 10-12 fresh basil leaves (stack, roll, slice thinly).',
  '5. Add garlic and basil to tomatoes. Drizzle with 3 tbsp extra virgin olive oil.',
  '6. Season with 1/2 tsp salt, 1/4 tsp black pepper, splash of balsamic vinegar.',
  '7. Mix gently and let marinate 15-30 minutes at room temperature.',
  '8. Slice baguette diagonally into 1/2-inch thick slices.',
  '9. Brush both sides of bread with olive oil.',
  '10. Toast bread in oven or on grill pan until golden and crispy, about 2-3 minutes per side.',
  '11. While still warm, rub one side of each toast with cut garlic clove.',
  '12. Spoon tomato mixture generously onto garlic-rubbed side of toast.',
  '13. Drizzle with more olive oil and balsamic glaze. Serve immediately.'
] WHERE title = 'Bruschetta';

-- Update Caprese Salad with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Select 3 large ripe tomatoes (heirloom varieties work beautifully for color variety).',
  '2. Use 1 lb fresh mozzarella - buffalo mozzarella (mozzarella di bufala) is ideal.',
  '3. Slice tomatoes and mozzarella into 1/4-inch thick rounds.',
  '4. On a large platter, alternate tomato and mozzarella slices in overlapping rows or circles.',
  '5. Tuck fresh basil leaves between each tomato and mozzarella slice.',
  '6. Season generously with flaky sea salt and freshly cracked black pepper.',
  '7. Drizzle high-quality extra virgin olive oil over the entire platter.',
  '8. Optional: Add a drizzle of aged balsamic vinegar or balsamic glaze.',
  '9. Let sit at room temperature 10-15 minutes before serving to bring out flavors.',
  '10. Serve as an appetizer or light lunch with crusty Italian bread.'
] WHERE title = 'Caprese Salad';

-- Update Paella with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Heat 6 cups chicken stock with 1/2 tsp saffron threads. Keep warm.',
  '2. Season 1 lb chicken thighs with salt and paprika. Sear in large paella pan with 1/4 cup olive oil until golden. Remove and set aside.',
  '3. In same pan, sauté 1/2 lb chorizo slices until crispy. Remove and reserve.',
  '4. Add 1 diced onion, 4 minced garlic cloves, 1 diced red pepper to pan. Cook 5 minutes.',
  '5. Add 2 cups bomba or Calasparra rice (do not substitute). Toast 2 minutes, stirring.',
  '6. Pour in 1/2 cup white wine, let it absorb completely.',
  '7. Add hot saffron stock, 1 can diced tomatoes, 1 tsp smoked paprika. Stir once to distribute.',
  '8. Nestle chicken back into rice. DO NOT STIR from this point.',
  '9. Cook on medium 10 minutes, then add chorizo, 1/2 lb cleaned mussels, 1/2 lb shrimp.',
  '10. Add 1/2 cup peas. Continue cooking 8-10 minutes until rice absorbs liquid.',
  '11. Increase heat for final 2 minutes to create socarrat (crispy bottom layer).',
  '12. Remove from heat, cover with foil, rest 5 minutes.',
  '13. Garnish with lemon wedges and fresh parsley. Serve family-style from the pan.'
] WHERE title = 'Paella';

-- Update Carbonara with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Bring large pot of well-salted water to boil for pasta.',
  '2. Cut 8 oz guanciale (or pancetta) into small cubes or strips.',
  '3. In bowl, whisk together 4 egg yolks + 2 whole eggs.',
  '4. Add 1 cup finely grated Pecorino Romano cheese to eggs. Mix well. Set aside.',
  '5. Cook 1 lb spaghetti until al dente (1 minute less than package directions).',
  '6. Meanwhile, cook guanciale in large cold pan, gradually increasing heat to medium.',
  '7. Cook until fat renders and meat is crispy, about 8-10 minutes. Remove from heat.',
  '8. Reserve 1.5 cups pasta water before draining pasta.',
  '9. Add hot drained pasta to guanciale pan (off heat!).',
  '10. Toss pasta with fat. Let cool 1 minute (too hot will scramble eggs).',
  '11. Pour egg mixture over pasta. Toss vigorously, adding pasta water as needed to create creamy sauce.',
  '12. Season generously with freshly cracked black pepper.',
  '13. Serve immediately with extra Pecorino and pepper on top. Never add cream!'
] WHERE title = 'Carbonara';