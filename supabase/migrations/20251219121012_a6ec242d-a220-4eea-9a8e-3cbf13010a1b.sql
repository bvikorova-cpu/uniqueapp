-- Update Brownies with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Preheat oven to 350°F (175°C). Line 9x13 inch pan with parchment paper, leaving overhang for easy removal.',
  '2. Melt 1 cup (2 sticks) unsalted butter in saucepan over medium heat.',
  '3. Add 2 cups sugar to hot butter. Stir to combine. Remove from heat.',
  '4. Add 4 oz (4 squares) unsweetened chocolate, chopped. Stir until melted and smooth.',
  '5. Let mixture cool 5 minutes - too hot will scramble the eggs.',
  '6. Add 4 eggs one at a time, mixing well after each.',
  '7. Add 2 tsp vanilla extract.',
  '8. Sift in 1 cup all-purpose flour, 1/2 tsp salt, 1/4 tsp baking powder.',
  '9. Fold gently until just combined. Do not overmix.',
  '10. Optional: fold in 1 cup chocolate chips or chopped walnuts.',
  '11. Pour batter into prepared pan. Spread evenly.',
  '12. For fudgy center: bake 25-30 minutes until top is set but toothpick comes out with moist crumbs.',
  '13. For cakey brownies: bake 35-40 minutes until toothpick comes out clean.',
  '14. Cool completely in pan before lifting out by parchment overhang.',
  '15. Cut with sharp knife, wiping blade between cuts for clean edges. Dust with powdered sugar if desired.'
] WHERE title = 'Brownies';

-- Update Coleslaw with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Quarter and core 1/2 head green cabbage. Slice very thinly with knife or mandoline.',
  '2. Peel and grate 2 large carrots using large holes of box grater.',
  '3. Thinly slice 1/4 red onion. Soak in cold water 10 minutes to mellow sharpness, then drain.',
  '4. Combine vegetables in large bowl.',
  '5. For creamy dressing: whisk 3/4 cup mayonnaise, 2 tbsp apple cider vinegar, 1 tbsp Dijon mustard.',
  '6. Add 2 tbsp sugar (adjust to taste), 1/2 tsp celery seed, salt and pepper.',
  '7. For lighter dressing: use half mayo, half Greek yogurt.',
  '8. Pour dressing over vegetables. Toss thoroughly to coat everything.',
  '9. Cover and refrigerate at least 1 hour, preferably 4 hours or overnight.',
  '10. The cabbage will soften and flavors will meld as it sits.',
  '11. Before serving, toss again. Taste and adjust seasoning - may need more salt or vinegar.',
  '12. Optional additions: chopped apple, dried cranberries, sunflower seeds, or fresh herbs.',
  '13. Serve cold as a side dish with barbecue, fried chicken, or sandwiches.',
  '14. Keeps refrigerated up to 5 days - flavor improves after day one!'
] WHERE title = 'Coleslaw';

-- Update Fried Rice with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Use day-old refrigerated rice - freshly cooked rice is too moist and will become mushy.',
  '2. Break up 3 cups cold rice with hands, separating all clumps.',
  '3. Dice 2 cups vegetables: carrots, peas, corn, bell peppers. Cut into small uniform pieces.',
  '4. Scramble 3 eggs in small bowl. Slice 4 green onions, separating white and green parts.',
  '5. Heat wok or large skillet over HIGH heat until smoking. Add 2 tbsp vegetable oil.',
  '6. Add vegetables, stir-fry 2-3 minutes until crisp-tender. Remove.',
  '7. Add 1 tbsp oil to wok. Pour in eggs, scramble until just set. Remove.',
  '8. Add 2 tbsp oil to wok (it should smoke immediately). Add white parts of green onions.',
  '9. Add rice immediately. Press flat against wok, let sit 30 seconds to get slightly crispy.',
  '10. Toss and repeat pressing. Continue 3-4 minutes until rice is heated and slightly charred.',
  '11. Push rice to sides. Add 3 tbsp soy sauce and 1 tbsp sesame oil to center of wok.',
  '12. Let sizzle, then toss everything together.',
  '13. Return vegetables and eggs to wok. Toss to combine.',
  '14. Add green onion tops. Season with white pepper.',
  '15. Serve immediately. The key is high heat and not overcrowding the wok!'
] WHERE title = 'Fried Rice';

-- Update Fresh Juice with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Select fresh, ripe fruits - the quality of juice depends entirely on fruit quality.',
  '2. Wash all fruits thoroughly under running water.',
  '3. For citrus (orange, grapefruit): Cut in half. Juice using citrus juicer, straining seeds.',
  '4. For soft fruits (watermelon, mango, berries): cut into chunks, blend, then strain through fine mesh.',
  '5. For apple/pear: Quarter and remove core. Process through juicer with skin on.',
  '6. For vegetables (cucumber, celery, greens): wash well, cut into chunks, juice fresh.',
  '7. Popular combinations: Apple-carrot-ginger, Orange-mango, Cucumber-celery-apple-lemon.',
  '8. Add fresh ginger (1-inch piece) or turmeric for health boost.',
  '9. For green juice: start with mild greens (spinach, cucumber), add apple for sweetness.',
  '10. Strain juice through fine mesh strainer for smoother texture if desired.',
  '11. Add squeeze of lemon to brighten flavors and prevent oxidation.',
  '12. Fresh juice oxidizes quickly - drink within 15 minutes for maximum nutrition.',
  '13. Can refrigerate in airtight container up to 24 hours, but will separate.',
  '14. Shake well before drinking. Serve over ice if desired.'
] WHERE title = 'Fresh Juice';