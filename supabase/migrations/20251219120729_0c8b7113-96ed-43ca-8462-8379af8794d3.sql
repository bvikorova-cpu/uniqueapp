-- Update Mushroom Risotto with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Heat 6 cups chicken or vegetable stock in saucepan. Keep at low simmer.',
  '2. Clean 1 lb mixed mushrooms (cremini, shiitake, porcini). Slice evenly.',
  '3. In large heavy-bottomed pan, sauté mushrooms in 2 tbsp butter until golden. Season with salt. Remove and set aside.',
  '4. In same pan, add 2 tbsp butter and 2 tbsp olive oil over medium heat.',
  '5. Sauté 1 finely diced shallot until translucent, about 3 minutes.',
  '6. Add 1.5 cups Arborio rice. Toast, stirring constantly, until edges become translucent (2-3 minutes).',
  '7. Add 1/2 cup dry white wine. Stir until completely absorbed.',
  '8. Add warm stock one ladle at a time, stirring frequently. Wait until liquid is almost absorbed before adding more.',
  '9. Continue for 18-20 minutes until rice is creamy but still has slight bite (al dente).',
  '10. Remove from heat. Stir in sautéed mushrooms, 2 tbsp butter, 1/2 cup grated Parmesan.',
  '11. Add 2 tbsp fresh thyme leaves. Season with salt and white pepper.',
  '12. Cover and rest 2 minutes - risotto will continue to absorb liquid.',
  '13. Serve in warm bowls. Top with shaved Parmesan and drizzle of truffle oil if desired.'
] WHERE title = 'Mushroom Risotto';

-- Update French Onion Soup with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Slice 4 large yellow onions into thin half-moons (about 2 lbs total).',
  '2. Melt 4 tbsp butter in large heavy pot or Dutch oven over medium heat.',
  '3. Add onions and 1 tsp salt. Cook, stirring occasionally, for 45-60 minutes.',
  '4. The key is patience - onions should become deeply caramelized and jammy, not just soft.',
  '5. Add 2 minced garlic cloves, cook 1 minute until fragrant.',
  '6. Sprinkle 1 tbsp flour over onions, stir to coat. Cook 2 minutes.',
  '7. Add 1/2 cup dry white wine or sherry, scraping up browned bits from bottom.',
  '8. Add 8 cups beef stock, 2 sprigs fresh thyme, 1 bay leaf.',
  '9. Simmer uncovered 20-30 minutes. Season with salt and pepper to taste.',
  '10. Preheat broiler. Ladle soup into oven-safe crocks.',
  '11. Cut baguette into 1-inch thick rounds. Toast lightly.',
  '12. Float toasted bread on soup. Top generously with grated Gruyère cheese.',
  '13. Broil 2-3 minutes until cheese is melted, bubbly, and golden brown.',
  '14. Let cool slightly before serving - bowls will be extremely hot!'
] WHERE title = 'French Onion Soup';

-- Update Steak with Fries with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Remove steak from refrigerator 1 hour before cooking to bring to room temperature.',
  '2. For fries: Cut 2 lbs russet potatoes into 1/4-inch thick sticks. Soak in cold water 30 minutes.',
  '3. Drain and dry potatoes thoroughly with kitchen towels.',
  '4. Heat oil to 300°F (150°C). Blanch fries in batches for 4-5 minutes until soft but not colored. Remove to rack.',
  '5. Increase oil temperature to 375°F (190°C). Fry again until golden and crispy, 2-3 minutes. Season immediately with salt.',
  '6. Pat steak dry with paper towels. Season generously with salt and pepper on both sides.',
  '7. Heat cast iron skillet over high heat until smoking. Add 1 tbsp high smoke-point oil.',
  '8. Lay steak away from you in pan. Sear 3-4 minutes without moving for good crust.',
  '9. Flip and sear another 3-4 minutes for medium-rare (adjust time for preference).',
  '10. Add 2 tbsp butter, 2 crushed garlic cloves, and fresh thyme to pan.',
  '11. Baste steak with foaming butter for 1-2 minutes.',
  '12. Rest steak on cutting board for 5-10 minutes (essential for juicy meat!).',
  '13. Slice against the grain if desired. Serve with hot fries and compound butter or béarnaise sauce.'
] WHERE title = 'Steak with Fries';

-- Update Chicken Teriyaki with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Make teriyaki sauce: Combine 1/2 cup soy sauce, 1/4 cup mirin, 2 tbsp sake, 3 tbsp sugar in saucepan.',
  '2. Bring to simmer, stir until sugar dissolves. Simmer 5 minutes until slightly thickened. Set aside.',
  '3. Pound 1.5 lbs boneless chicken thighs to even thickness (about 1/2 inch).',
  '4. Season chicken lightly with salt and pepper.',
  '5. Heat 1 tbsp vegetable oil in large skillet over medium-high heat.',
  '6. Add chicken skin-side down (if skin-on). Cook without moving 5-6 minutes until golden.',
  '7. Flip chicken, cook another 4-5 minutes until almost cooked through.',
  '8. Reduce heat to medium. Pour teriyaki sauce over chicken.',
  '9. Let sauce bubble and coat chicken, turning pieces to glaze evenly, about 2-3 minutes.',
  '10. Check internal temperature reaches 165°F (74°C).',
  '11. Remove chicken to cutting board. Let rest 3 minutes.',
  '12. Slice chicken on diagonal into strips.',
  '13. Arrange over steamed rice. Drizzle with remaining pan sauce.',
  '14. Garnish with sesame seeds and sliced green onions. Serve immediately.'
] WHERE title = 'Chicken Teriyaki';