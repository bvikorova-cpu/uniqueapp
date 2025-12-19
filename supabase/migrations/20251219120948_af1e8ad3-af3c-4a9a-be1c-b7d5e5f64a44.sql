-- Update Fish and Chips with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Cut 2 lbs russet potatoes into 1/2-inch thick chips. Soak in cold water 30 minutes to remove starch.',
  '2. Drain and dry chips thoroughly with kitchen towels - this is crucial for crispiness!',
  '3. For double-frying method: Heat oil to 325°F (165°C). Blanch chips 5 minutes until soft but not colored.',
  '4. Remove chips to wire rack. Can rest up to 2 hours.',
  '5. Cut 1.5 lbs cod or haddock into 4 portions. Pat very dry. Season with salt and pepper.',
  '6. Make batter: Whisk 1 cup flour, 1 tsp baking powder, 1/2 tsp salt.',
  '7. Slowly whisk in 1 cup ice-cold beer (lager works best) until smooth.',
  '8. Let batter rest 15 minutes. It should be thick enough to coat back of spoon.',
  '9. Heat oil to 375°F (190°C) for fish.',
  '10. Dust fish with flour, shaking off excess. Dip in batter, letting excess drip off.',
  '11. Carefully lower fish into oil. Fry 4-5 minutes per side until deep golden and crispy.',
  '12. Drain fish on wire rack. Season immediately with salt.',
  '13. Re-fry chips at 375°F for 3-4 minutes until golden and crispy. Season with salt.',
  '14. Serve immediately with malt vinegar, tartar sauce, mushy peas, and lemon wedges.',
  '15. Wrap in newspaper (or parchment paper) for authentic British presentation!'
] WHERE title = 'Fish and Chips';

-- Update Guacamole with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Select 3-4 ripe avocados (should yield to gentle pressure but not be mushy).',
  '2. Cut avocados in half, remove pit. Score flesh in grid pattern while still in skin.',
  '3. Scoop avocado into bowl. Add juice of 2 fresh limes (about 3 tbsp).',
  '4. Mash with fork to desired consistency - chunky is traditional.',
  '5. Finely dice 1/4 cup red onion. Soak in cold water 5 minutes to remove harsh bite, then drain.',
  '6. Finely mince 1-2 serrano or jalapeño peppers (remove seeds for less heat).',
  '7. Mince 1/4 cup fresh cilantro. Set aside some leaves for garnish.',
  '8. Dice 1 ripe tomato. Remove seeds and juice to prevent watery guacamole.',
  '9. Add onion, peppers, most of cilantro, and tomato to avocado. Mix gently.',
  '10. Season with 3/4 tsp salt (or more to taste), pinch of cumin.',
  '11. Optional: add 1 minced garlic clove for extra flavor.',
  '12. Taste and adjust lime, salt, and heat as needed.',
  '13. Transfer to serving bowl. Garnish with remaining cilantro.',
  '14. Cover with plastic wrap pressed directly on surface to prevent browning.',
  '15. Serve within 2 hours with fresh tortilla chips. Best eaten same day!'
] WHERE title = 'Guacamole';

-- Update Pancakes with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. In large bowl, whisk together 2 cups all-purpose flour, 2 tbsp sugar, 2 tsp baking powder, 1 tsp baking soda, 1/2 tsp salt.',
  '2. In separate bowl, whisk 2 eggs, 2 cups buttermilk (or regular milk + 2 tbsp lemon juice), 1/4 cup melted butter.',
  '3. Make well in dry ingredients. Pour in wet ingredients.',
  '4. Stir gently until JUST combined - lumps are okay! Overmixing makes tough pancakes.',
  '5. Let batter rest 5 minutes while heating griddle.',
  '6. Heat non-stick griddle or skillet over medium heat (350°F/175°C). Lightly butter.',
  '7. Test heat: drop of water should sizzle and evaporate.',
  '8. Pour 1/4 cup batter for each pancake. Do not spread.',
  '9. Cook until bubbles form on surface and edges look set, about 2-3 minutes.',
  '10. Flip only once! Cook another 1-2 minutes until golden brown.',
  '11. Keep finished pancakes warm in 200°F oven on wire rack (not stacked - they''ll get soggy).',
  '12. Wipe griddle and add butter between batches.',
  '13. Optional add-ins: fold blueberries or chocolate chips into batter, or add to pancakes after pouring.',
  '14. Serve hot with real maple syrup, butter, fresh berries, or whipped cream.'
] WHERE title = 'Pancakes';

-- Update Banana Pancakes with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Mash 2 very ripe bananas in large bowl until mostly smooth (some small lumps are fine).',
  '2. Whisk in 2 eggs, 1/4 cup milk, 2 tbsp melted butter, 1 tsp vanilla extract.',
  '3. In separate bowl, mix 1 cup flour, 1 tbsp sugar, 1 tsp baking powder, 1/2 tsp cinnamon, pinch of salt.',
  '4. Add dry ingredients to banana mixture. Fold gently until just combined.',
  '5. Let batter rest 5 minutes - this allows flour to hydrate.',
  '6. Heat non-stick pan or griddle over medium-low heat. Add small amount of butter.',
  '7. These pancakes brown faster due to sugar in bananas - use lower heat than regular pancakes!',
  '8. Pour about 3 tbsp batter per pancake.',
  '9. Add optional toppings now: sliced bananas, blueberries, chocolate chips, or chopped walnuts.',
  '10. Cook until edges look set and small bubbles form, about 2-3 minutes.',
  '11. Flip gently (these are more delicate). Cook 1-2 minutes more.',
  '12. Keep warm in low oven while making remaining pancakes.',
  '13. Serve stacked with sliced fresh bananas, drizzle of honey or maple syrup.',
  '14. Top with whipped cream, chopped nuts, or chocolate sauce for extra indulgence.'
] WHERE title = 'Banana Pancakes';