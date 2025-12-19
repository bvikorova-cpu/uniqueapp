-- Update Pizza Margherita with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Make dough: Dissolve 1 tsp yeast and 1 tsp sugar in 1 cup warm water (110°F). Let sit 5 minutes until foamy.',
  '2. Mix 3 cups flour (preferably 00 flour) with 1 tsp salt. Add yeast mixture and 2 tbsp olive oil.',
  '3. Knead dough 10 minutes until smooth and elastic. Place in oiled bowl, cover, rise 1-2 hours until doubled.',
  '4. Make sauce: Crush 1 can (14 oz) whole San Marzano tomatoes by hand. Add 1 minced garlic clove, 1 tbsp olive oil, salt, fresh basil.',
  '5. Do not cook the sauce - fresh is traditional for Margherita.',
  '6. Preheat oven to highest setting (500-550°F/260-290°C) with pizza stone inside for at least 30 minutes.',
  '7. Punch down dough. Divide into 2 portions. Let rest 15 minutes.',
  '8. On floured surface, stretch dough into 12-inch circle. Use hands, not rolling pin, for authentic texture.',
  '9. Transfer dough to floured pizza peel or parchment paper.',
  '10. Spread thin layer of sauce, leaving 1/2 inch border for crust.',
  '11. Tear 8 oz fresh mozzarella (preferably buffalo) into pieces. Distribute evenly.',
  '12. Drizzle with olive oil. Add few fresh basil leaves.',
  '13. Slide onto preheated stone. Bake 8-12 minutes until crust is golden and cheese is bubbling.',
  '14. Remove, add more fresh basil, drizzle olive oil. Slice and serve immediately.'
] WHERE title = 'Pizza';

-- Update Falafel with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Soak 2 cups dried chickpeas in cold water overnight (12+ hours). Do NOT use canned chickpeas - they are too wet!',
  '2. Drain chickpeas thoroughly. Pat dry with kitchen towels.',
  '3. Add to food processor: chickpeas, 1 cup fresh parsley, 1/2 cup fresh cilantro, 1 small onion quartered.',
  '4. Add 5 garlic cloves, 1 tsp cumin, 1 tsp coriander, 1/4 tsp cayenne, salt and pepper.',
  '5. Pulse until mixture resembles coarse sand - not a paste! Should hold together when squeezed.',
  '6. Transfer to bowl. Stir in 1 tsp baking powder and 2 tbsp flour. Refrigerate 1 hour.',
  '7. Form mixture into 1.5-inch balls or patties. Place on parchment-lined tray.',
  '8. Heat 3 inches of vegetable oil to 350°F (175°C) in deep pot.',
  '9. Fry falafel in batches (don''t crowd), turning occasionally, until deep golden brown - about 3-4 minutes.',
  '10. Remove with slotted spoon. Drain on paper towel-lined plate.',
  '11. Serve in warm pita with tahini sauce, pickled vegetables, fresh tomatoes, and lettuce.',
  '12. For tahini sauce: whisk 1/2 cup tahini, 1/4 cup lemon juice, 2 tbsp water, 1 garlic clove minced, salt.'
] WHERE title = 'Falafel';

-- Update Hummus with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. If using dried chickpeas: soak overnight, then cook with 1/2 tsp baking soda until very soft (1-2 hours).',
  '2. If using canned: drain and rinse 2 cans (30 oz total) chickpeas. Reserve some for garnish.',
  '3. For ultra-smooth hummus: rub chickpeas between hands to remove skins. This step is optional but recommended.',
  '4. Add 1/2 cup tahini to food processor. Process 2 minutes until light and whipped.',
  '5. Add 1/4 cup fresh lemon juice (about 2 lemons), 1 minced garlic clove. Process 1 minute.',
  '6. Add chickpeas. Process 2-3 minutes, scraping down sides.',
  '7. With processor running, drizzle in 3-4 tbsp ice cold water. This makes it extra creamy.',
  '8. Add 1/2 tsp cumin, 1 tsp salt. Process until completely smooth - about 2 more minutes.',
  '9. Taste and adjust seasoning. Add more lemon, salt, or garlic as needed.',
  '10. Transfer to serving bowl. Create swirls with back of spoon.',
  '11. Drizzle generously with extra virgin olive oil. Sprinkle with paprika and cumin.',
  '12. Garnish with reserved whole chickpeas, chopped parsley, and pine nuts if desired.',
  '13. Serve with warm pita bread, fresh vegetables, or falafel.'
] WHERE title = 'Hummus';

-- Update Baklava with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Mix 3 cups chopped walnuts or pistachios with 1/2 cup sugar, 1 tsp cinnamon, 1/4 tsp cloves.',
  '2. Melt 1.5 cups (3 sticks) unsalted butter. Clarify by skimming foam.',
  '3. Preheat oven to 350°F (175°C). Brush 9x13 inch pan with melted butter.',
  '4. Unroll phyllo dough. Keep covered with damp towel while working to prevent drying.',
  '5. Layer 8 phyllo sheets in pan, brushing each generously with melted butter.',
  '6. Spread 1/3 of nut mixture evenly over phyllo.',
  '7. Layer 4 more phyllo sheets with butter, then another 1/3 nuts.',
  '8. Repeat: 4 phyllo with butter, remaining nuts.',
  '9. Top with final 8 phyllo sheets, buttering each one. Brush top generously.',
  '10. Using sharp knife, cut into diamond or square shapes BEFORE baking. Cut all the way through.',
  '11. Bake 50-60 minutes until golden brown and crispy.',
  '12. While baking, make syrup: boil 1 cup sugar, 1 cup water, 1 cup honey, 1 tbsp lemon juice, cinnamon stick.',
  '13. Simmer 10 minutes. Add 1 tsp vanilla. Let cool slightly.',
  '14. Pour HOT syrup over HOT baklava immediately out of oven. You''ll hear sizzling - that''s perfect!',
  '15. Let cool completely at room temperature (4+ hours). The layers will absorb syrup and become crispy.'
] WHERE title = 'Baklava';