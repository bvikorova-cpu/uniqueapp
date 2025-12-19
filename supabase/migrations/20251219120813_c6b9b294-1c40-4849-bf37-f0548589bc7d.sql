-- Update Tiramisu with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Brew 2 cups strong espresso. Let cool to room temperature. Add 2 tbsp coffee liqueur (optional).',
  '2. Separate 6 large eggs. Place yolks in large bowl, whites in separate clean bowl.',
  '3. Add 3/4 cup sugar to yolks. Whisk vigorously until thick, pale, and ribbon-like (5 minutes by hand).',
  '4. Add 1 lb (16 oz) mascarpone cheese to yolks. Fold gently until smooth and combined.',
  '5. Beat egg whites with pinch of salt until stiff peaks form.',
  '6. Gently fold whites into mascarpone mixture in three additions. Do not overmix.',
  '7. Pour espresso into shallow dish for dipping.',
  '8. Quickly dip ladyfingers (savoiardi) in coffee - just 1-2 seconds per side. Do not soak!',
  '9. Arrange single layer of dipped ladyfingers in 9x13 inch dish.',
  '10. Spread half the mascarpone cream evenly over ladyfingers.',
  '11. Repeat with another layer of dipped ladyfingers and remaining cream.',
  '12. Cover tightly with plastic wrap. Refrigerate minimum 6 hours, preferably overnight.',
  '13. Before serving, dust generously with unsweetened cocoa powder through fine sieve.',
  '14. Optional: garnish with chocolate shavings or espresso beans. Serve chilled.'
] WHERE title = 'Tiramisu';

-- Update Pad Thai with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Soak 8 oz rice noodles in room temperature water for 30-60 minutes until pliable. Drain.',
  '2. Make sauce: Whisk 3 tbsp fish sauce, 3 tbsp tamarind paste, 2 tbsp brown sugar, 1 tbsp rice vinegar.',
  '3. Press and cube 8 oz extra-firm tofu. Pat very dry with paper towels.',
  '4. Heat wok over high heat until smoking. Add 2 tbsp oil.',
  '5. Fry tofu until golden on all sides, about 5 minutes. Remove and set aside.',
  '6. Add 1 tbsp oil to wok. Add 8 oz shrimp, cook 1-2 minutes until pink. Remove.',
  '7. Add 2 tbsp oil. Sauté 3 minced garlic cloves and 2 minced shallots for 30 seconds.',
  '8. Add drained noodles to wok. Toss constantly for 1-2 minutes.',
  '9. Pour sauce over noodles. Toss until noodles absorb sauce and become glossy.',
  '10. Push noodles to one side. Crack 2 eggs into empty space. Scramble lightly.',
  '11. Mix eggs into noodles. Add tofu, shrimp, 1 cup bean sprouts, 3 sliced green onions.',
  '12. Add 1/4 cup crushed roasted peanuts. Toss everything together.',
  '13. Serve immediately with lime wedges, extra peanuts, chili flakes, and bean sprouts on side.'
] WHERE title = 'Pad Thai';

-- Update Beef Bourguignon with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Cut 3 lbs beef chuck into 2-inch cubes. Pat dry thoroughly with paper towels.',
  '2. Season beef generously with salt and pepper.',
  '3. In Dutch oven, cook 8 oz diced bacon until crispy. Remove bacon, reserve fat.',
  '4. Working in batches, sear beef in bacon fat until deeply browned on all sides. Remove and set aside.',
  '5. Add 2 cups pearl onions (or 2 sliced onions), cook until golden, about 8 minutes.',
  '6. Add 2 sliced carrots and 3 minced garlic cloves. Cook 3 minutes.',
  '7. Sprinkle 3 tbsp flour over vegetables. Stir and cook 2 minutes.',
  '8. Add 1 bottle (750ml) red Burgundy wine. Scrape up all browned bits.',
  '9. Add 2 cups beef stock, 2 tbsp tomato paste, 1 bouquet garni (thyme, bay leaf, parsley).',
  '10. Return beef and bacon to pot. Liquid should barely cover meat.',
  '11. Cover and braise in 325°F (165°C) oven for 2.5-3 hours until beef is fork-tender.',
  '12. Meanwhile, sauté 1 lb quartered mushrooms in butter until golden.',
  '13. Add mushrooms to stew in last 30 minutes of cooking.',
  '14. Skim fat from surface. Adjust seasoning. Serve over mashed potatoes or egg noodles.',
  '15. Garnish with fresh parsley. This dish tastes even better the next day!'
] WHERE title = 'Beef Bourguignon';

-- Update Crème Brûlée with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Preheat oven to 325°F (165°C). Place 6 ramekins in large baking dish.',
  '2. Heat 2 cups heavy cream with 1 split vanilla bean in saucepan until simmering. Remove from heat.',
  '3. Let cream steep 15 minutes. Scrape vanilla seeds into cream, discard pod.',
  '4. In bowl, whisk 6 egg yolks with 1/2 cup sugar until pale and thick.',
  '5. Slowly pour warm cream into yolks while whisking constantly (temper to prevent scrambling).',
  '6. Strain custard through fine-mesh sieve to remove any lumps.',
  '7. Divide custard evenly among ramekins.',
  '8. Pour hot water into baking dish until it reaches halfway up ramekins (water bath).',
  '9. Bake 40-50 minutes until custards are set but still jiggly in center.',
  '10. Remove ramekins from water bath. Cool to room temperature.',
  '11. Cover and refrigerate at least 4 hours or overnight until thoroughly chilled.',
  '12. Just before serving, sprinkle 1-2 tsp sugar evenly over each custard.',
  '13. Use kitchen torch to caramelize sugar until it forms crisp, amber shell.',
  '14. Let sit 1-2 minutes for sugar to harden. Serve immediately - the magic is the contrast!'
] WHERE title = 'Crème Brûlée';