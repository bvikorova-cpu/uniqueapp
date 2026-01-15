-- Professional Recipe Overhaul - 100% English with Detailed Content

-- Update Caprese Salad (has Slovak text in ingredients)
UPDATE recipes SET
  description = 'Classic Italian appetizer featuring fresh mozzarella, ripe tomatoes, and fragrant basil',
  ingredients = ARRAY[
    '400g fresh buffalo mozzarella',
    '4 large ripe tomatoes (heirloom preferred)',
    '1 bunch fresh basil leaves',
    '4 tbsp extra virgin olive oil',
    '2 tbsp aged balsamic vinegar',
    '1/2 tsp flaky sea salt',
    '1/4 tsp freshly ground black pepper',
    '30g toasted pine nuts (optional)',
    '50g shaved Parmesan'
  ],
  instructions = ARRAY[
    'Select 4 large ripe tomatoes - heirloom varieties provide beautiful color variation.',
    'Drain 400g fresh buffalo mozzarella and pat dry with paper towels.',
    'Slice tomatoes and mozzarella into even 1/4-inch (6mm) thick rounds.',
    'Arrange alternating slices of tomato and mozzarella in overlapping rows on a large serving platter.',
    'Tuck fresh basil leaves between each tomato and mozzarella slice for visual appeal.',
    'Season generously with flaky sea salt and freshly cracked black pepper.',
    'Drizzle 4 tbsp high-quality extra virgin olive oil evenly over the entire platter.',
    'Finish with 2 tbsp aged balsamic glaze and optional toasted pine nuts. Serve at room temperature.'
  ]
WHERE title = 'Caprese Salad';

-- Update Bruschetta with more detailed instructions
UPDATE recipes SET
  description = 'Traditional Italian toasted bread topped with fresh tomatoes, garlic, and basil',
  ingredients = ARRAY[
    '1 French baguette or Italian ciabatta (about 400g)',
    '6 large ripe Roma tomatoes',
    '4 cloves fresh garlic (minced)',
    '1 bunch fresh basil (about 20 leaves)',
    '5 tbsp extra virgin olive oil',
    '2 tbsp aged balsamic vinegar',
    '1 tsp flaky sea salt',
    '1/2 tsp freshly ground black pepper',
    '50g freshly grated Parmesan (optional)'
  ],
  instructions = ARRAY[
    'Preheat oven to 400°F (200°C) or heat a grill pan over medium-high heat.',
    'Dice 6 ripe Roma tomatoes into 1/4-inch cubes, removing excess seeds and juice.',
    'Finely mince 4 cloves of fresh garlic. Chiffonade 20 basil leaves by stacking, rolling, and slicing thinly.',
    'Combine tomatoes, garlic, and basil in a bowl. Add 3 tbsp olive oil, balsamic vinegar, salt, and pepper.',
    'Let the tomato mixture marinate at room temperature for 20-30 minutes to develop flavors.',
    'Slice baguette diagonally into 1/2-inch thick pieces. Brush both sides with remaining olive oil.',
    'Toast bread slices until golden and crispy, about 2-3 minutes per side. Rub warm toast with cut garlic.',
    'Spoon marinated tomato mixture generously onto each toast. Drizzle with extra balsamic glaze and serve immediately.'
  ]
WHERE title = 'Bruschetta';

-- Update Garlic Bread
UPDATE recipes SET
  description = 'Golden, crispy bread infused with rich garlic butter and fresh herbs',
  ingredients = ARRAY[
    '1 large French baguette (350g)',
    '120g unsalted butter (softened)',
    '6 cloves fresh garlic (finely minced)',
    '3 tbsp fresh parsley (finely chopped)',
    '1 tbsp fresh chives (minced)',
    '1 tsp dried oregano',
    '1/2 tsp salt',
    '1/4 tsp black pepper',
    '50g grated Parmesan cheese'
  ],
  instructions = ARRAY[
    'Preheat oven to 375°F (190°C). Line a baking sheet with aluminum foil.',
    'In a bowl, combine softened butter with minced garlic, parsley, chives, oregano, salt, and pepper.',
    'Mix thoroughly until all ingredients are evenly distributed throughout the butter.',
    'Slice the baguette in half lengthwise, creating two long pieces.',
    'Spread the garlic butter mixture generously and evenly over the cut surfaces of both halves.',
    'Sprinkle grated Parmesan cheese over the buttered bread.',
    'Place bread cut-side up on the baking sheet. Bake for 12-15 minutes until edges are golden and crispy.',
    'Remove from oven, let cool for 2 minutes, then slice into 2-inch pieces. Serve warm immediately.'
  ]
WHERE title = 'Garlic Bread';

-- Update Tzatziki
UPDATE recipes SET
  description = 'Creamy Greek yogurt dip with cucumber, garlic, and fresh dill',
  ingredients = ARRAY[
    '500g Greek yogurt (full-fat)',
    '1 large English cucumber',
    '4 cloves fresh garlic (minced)',
    '3 tbsp extra virgin olive oil',
    '2 tbsp fresh lemon juice',
    '2 tbsp fresh dill (finely chopped)',
    '1 tbsp fresh mint (optional)',
    '1 tsp salt',
    '1/4 tsp white pepper'
  ],
  instructions = ARRAY[
    'Grate the cucumber using a box grater. Place grated cucumber in a fine mesh sieve over a bowl.',
    'Sprinkle 1/2 tsp salt over cucumber and let drain for 20 minutes. Squeeze out excess moisture with clean hands.',
    'In a large mixing bowl, combine Greek yogurt with the drained cucumber.',
    'Add minced garlic, olive oil, lemon juice, dill, and mint. Mix until well combined.',
    'Season with remaining salt and white pepper. Taste and adjust seasonings as needed.',
    'Cover with plastic wrap and refrigerate for at least 1 hour to allow flavors to meld.',
    'Before serving, drizzle with a little extra olive oil and garnish with fresh dill.',
    'Serve cold with warm pita bread, fresh vegetables, or as a sauce for grilled meats.'
  ]
WHERE title = 'Tzatziki';

-- Update Feta Salad
UPDATE recipes SET
  description = 'Refreshing Mediterranean salad with creamy feta, olives, and crisp vegetables',
  ingredients = ARRAY[
    '200g feta cheese (block, cubed)',
    '4 ripe medium tomatoes',
    '1 large English cucumber',
    '1 red onion (thinly sliced)',
    '150g Kalamata olives (pitted)',
    '1 green bell pepper',
    '4 tbsp extra virgin olive oil',
    '2 tbsp red wine vinegar',
    '1 tsp dried oregano',
    '1/2 tsp salt',
    '1/4 tsp black pepper'
  ],
  instructions = ARRAY[
    'Cut tomatoes into wedges. Slice cucumber in half lengthwise, then into 1/2-inch thick half-moons.',
    'Thinly slice the red onion into rings. Core and slice green bell pepper into strips.',
    'Combine tomatoes, cucumber, red onion, bell pepper, and olives in a large salad bowl.',
    'In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.',
    'Pour the dressing over the vegetables and toss gently to coat.',
    'Cut feta cheese into 1-inch cubes and scatter over the top of the salad.',
    'Sprinkle additional dried oregano over the feta for presentation.',
    'Let salad rest for 5 minutes before serving to allow flavors to combine. Serve with crusty bread.'
  ]
WHERE title = 'Feta Salad';

-- Update Spring Mix Salad
UPDATE recipes SET
  description = 'Light and crisp spring greens with honey mustard vinaigrette',
  ingredients = ARRAY[
    '200g mixed spring greens (arugula, spinach, mesclun)',
    '100g cherry tomatoes (halved)',
    '1 small cucumber (sliced)',
    '50g toasted walnuts',
    '50g dried cranberries',
    '50g crumbled goat cheese',
    '3 tbsp extra virgin olive oil',
    '1 tbsp Dijon mustard',
    '1 tbsp honey',
    '1 tbsp apple cider vinegar',
    '1/4 tsp salt'
  ],
  instructions = ARRAY[
    'Wash spring greens thoroughly and spin dry in a salad spinner. Place in a large bowl.',
    'Halve the cherry tomatoes. Slice cucumber into thin rounds.',
    'Toast walnuts in a dry pan over medium heat for 3-4 minutes until fragrant. Let cool.',
    'In a small jar, combine olive oil, Dijon mustard, honey, apple cider vinegar, and salt.',
    'Shake vigorously for 30 seconds until emulsified into a smooth vinaigrette.',
    'Add tomatoes, cucumber, toasted walnuts, and dried cranberries to the greens.',
    'Drizzle desired amount of vinaigrette over the salad and toss gently.',
    'Top with crumbled goat cheese. Serve immediately while greens are crisp.'
  ]
WHERE title = 'Spring Mix';

-- Update Marinara Pizza
UPDATE recipes SET
  description = 'Classic Neapolitan pizza with rich tomato sauce, garlic, and fresh oregano',
  ingredients = ARRAY[
    '400g pizza dough (homemade or store-bought)',
    '200g San Marzano tomatoes (crushed)',
    '4 cloves fresh garlic (thinly sliced)',
    '4 tbsp extra virgin olive oil',
    '1 tbsp fresh oregano leaves',
    '1/2 tsp dried oregano',
    '1/2 tsp salt',
    '1/4 tsp red pepper flakes',
    'Semolina flour for dusting'
  ],
  instructions = ARRAY[
    'Preheat oven to highest setting (500°F/260°C) with a pizza stone inside for at least 45 minutes.',
    'Stretch 400g pizza dough into a 12-inch round on a floured surface. Transfer to semolina-dusted peel.',
    'Crush San Marzano tomatoes by hand and spread evenly over dough, leaving a 1-inch border.',
    'Distribute thinly sliced garlic evenly across the pizza surface.',
    'Drizzle 3 tbsp olive oil over the pizza. Season with salt and red pepper flakes.',
    'Carefully slide pizza onto the preheated stone. Bake for 8-10 minutes until crust is charred in spots.',
    'Remove from oven. Drizzle remaining olive oil over the hot pizza.',
    'Scatter fresh oregano leaves over the top. Slice and serve immediately while hot.'
  ]
WHERE title = 'Marinara Pizza';

-- Update Protein Shake
UPDATE recipes SET
  description = 'High-protein post-workout shake with banana, peanut butter, and chocolate',
  ingredients = ARRAY[
    '1 large ripe banana (frozen)',
    '30g chocolate whey protein powder',
    '2 tbsp natural peanut butter',
    '250ml unsweetened almond milk',
    '1 tbsp raw cacao powder',
    '1 tbsp honey or maple syrup',
    '1/2 tsp vanilla extract',
    '1/2 cup ice cubes',
    '1 tbsp chia seeds (optional)'
  ],
  instructions = ARRAY[
    'Peel and freeze the banana overnight for a thicker, creamier shake consistency.',
    'Add almond milk to the blender first to help the blades spin smoothly.',
    'Add frozen banana, protein powder, peanut butter, and cacao powder to the blender.',
    'Include honey, vanilla extract, and ice cubes for sweetness and thickness.',
    'Blend on high speed for 60-90 seconds until completely smooth and creamy.',
    'Taste and adjust sweetness by adding more honey if desired.',
    'Pour into a tall glass. Sprinkle chia seeds on top if using.',
    'Serve immediately for best texture. Contains approximately 35g protein per serving.'
  ]
WHERE title = 'Protein Shake';

-- Update Lemonade
UPDATE recipes SET
  description = 'Refreshing homemade lemonade with fresh-squeezed lemons and mint',
  ingredients = ARRAY[
    '6 large fresh lemons',
    '200g granulated sugar',
    '1.5 liters cold filtered water',
    '1/2 cup fresh mint leaves',
    '1 cup ice cubes',
    '1 lemon (sliced for garnish)',
    'Fresh mint sprigs for garnish'
  ],
  instructions = ARRAY[
    'Roll 6 lemons firmly on the counter to release more juice. Cut in half and juice thoroughly.',
    'Strain fresh lemon juice through a fine mesh sieve to remove seeds and pulp. You need about 1.5 cups.',
    'Make simple syrup: Heat 1 cup water with sugar in a saucepan, stirring until dissolved. Cool completely.',
    'Muddle mint leaves gently in the bottom of a large pitcher to release oils.',
    'Add strained lemon juice and cooled simple syrup to the pitcher with mint.',
    'Pour in remaining cold water and stir well to combine all ingredients.',
    'Add ice cubes and refrigerate for at least 30 minutes to chill thoroughly.',
    'Serve over ice, garnished with lemon slices and fresh mint sprigs.'
  ]
WHERE title = 'Lemonade';

-- Update Green Smoothie
UPDATE recipes SET
  description = 'Nutrient-packed green smoothie with spinach, apple, and ginger',
  ingredients = ARRAY[
    '100g fresh baby spinach',
    '1 medium green apple (cored, chopped)',
    '1 ripe banana',
    '1/2 cucumber (roughly chopped)',
    '15g fresh ginger (peeled)',
    '250ml coconut water',
    '1 tbsp fresh lime juice',
    '1 tbsp honey',
    '1/2 cup ice cubes'
  ],
  instructions = ARRAY[
    'Wash spinach thoroughly and add to the blender as the first layer.',
    'Core and roughly chop the green apple. Peel and break banana into chunks.',
    'Add apple, banana, and chopped cucumber to the blender.',
    'Peel fresh ginger and add along with coconut water and lime juice.',
    'Blend on low speed first, then increase to high for 60-90 seconds.',
    'Add ice cubes and honey. Blend again until completely smooth.',
    'Pour into glasses and serve immediately for maximum nutrient retention.',
    'For a thicker consistency, freeze the banana overnight before using.'
  ]
WHERE title = 'Green Smoothie';

-- Update Hot Chocolate
UPDATE recipes SET
  description = 'Rich and creamy homemade hot chocolate with real cocoa',
  ingredients = ARRAY[
    '500ml whole milk',
    '100g dark chocolate (70% cocoa, chopped)',
    '2 tbsp unsweetened cocoa powder',
    '2 tbsp sugar',
    '1/4 tsp vanilla extract',
    '1 pinch sea salt',
    '1/4 tsp ground cinnamon',
    'Whipped cream for topping',
    'Chocolate shavings for garnish'
  ],
  instructions = ARRAY[
    'Chop 100g dark chocolate into small, even pieces for smooth melting.',
    'In a medium saucepan, whisk together cocoa powder, sugar, cinnamon, and salt.',
    'Add 1/4 cup milk to the dry ingredients and whisk to form a smooth paste.',
    'Place saucepan over medium heat. Gradually add remaining milk while whisking continuously.',
    'When milk begins to steam (not boil), add chopped chocolate pieces.',
    'Reduce heat to low. Whisk constantly until chocolate is completely melted and mixture is smooth.',
    'Remove from heat and stir in vanilla extract. Taste and adjust sweetness if needed.',
    'Pour into mugs, top with whipped cream and chocolate shavings. Serve immediately.'
  ]
WHERE title = 'Hot Chocolate';

-- Update Iced Coffee
UPDATE recipes SET
  description = 'Smooth and refreshing cold brew style iced coffee',
  ingredients = ARRAY[
    '100g coarsely ground coffee beans',
    '1 liter cold filtered water',
    '200ml milk or cream (choice)',
    '2 tbsp simple syrup or sugar',
    '1/2 tsp vanilla extract',
    'Ice cubes',
    'Caramel sauce for drizzle (optional)'
  ],
  instructions = ARRAY[
    'Combine coarsely ground coffee with 1 liter cold water in a large jar or pitcher.',
    'Stir gently to ensure all grounds are saturated. Cover and refrigerate for 12-24 hours.',
    'Strain cold brew concentrate through a fine mesh sieve lined with cheesecloth.',
    'Store concentrate in the refrigerator for up to 2 weeks.',
    'To serve: Fill a tall glass completely with ice cubes.',
    'Pour cold brew concentrate to fill glass halfway. Add milk or cream to taste.',
    'Stir in simple syrup and vanilla extract until combined.',
    'Drizzle with caramel sauce if desired. Stir and enjoy immediately.'
  ]
WHERE title = 'Iced Coffee';

-- Update Ginger Tea
UPDATE recipes SET
  description = 'Warming ginger tea with honey and lemon for immune support',
  ingredients = ARRAY[
    '50g fresh ginger root',
    '1 liter filtered water',
    '3 tbsp raw honey',
    '2 fresh lemons',
    '1 cinnamon stick',
    '4 whole cloves',
    '1/4 tsp ground turmeric',
    'Fresh mint leaves (optional)'
  ],
  instructions = ARRAY[
    'Wash and thinly slice 50g fresh ginger - no need to peel if organic.',
    'Bring 1 liter water to a boil in a medium saucepan.',
    'Add sliced ginger, cinnamon stick, and cloves to the boiling water.',
    'Reduce heat to low and simmer for 15-20 minutes to extract maximum flavor.',
    'Remove from heat. Strain tea into a teapot or directly into cups.',
    'Add turmeric and stir well. Let cool slightly (not boiling) before adding honey.',
    'Squeeze fresh lemon juice into each cup to taste.',
    'Garnish with mint leaves if using. Serve warm for best soothing effects.'
  ]
WHERE title = 'Ginger Tea';

-- Update Tofu Stir-fry
UPDATE recipes SET
  description = 'Crispy tofu stir-fry with colorful vegetables in savory sauce',
  ingredients = ARRAY[
    '400g extra-firm tofu (pressed, cubed)',
    '2 tbsp vegetable oil',
    '1 red bell pepper (sliced)',
    '1 yellow bell pepper (sliced)',
    '200g broccoli florets',
    '100g snap peas',
    '3 cloves garlic (minced)',
    '2 tbsp soy sauce',
    '1 tbsp sesame oil',
    '1 tbsp rice vinegar',
    '1 tsp fresh ginger (grated)',
    '1 tbsp cornstarch',
    '2 tbsp water',
    'Sesame seeds for garnish'
  ],
  instructions = ARRAY[
    'Press tofu for 30 minutes between paper towels with a heavy weight. Cut into 1-inch cubes.',
    'Toss tofu cubes with 1 tbsp cornstarch and 1 tbsp soy sauce. Let marinate 10 minutes.',
    'Heat 1 tbsp oil in a large wok over high heat. Add tofu and cook until golden on all sides, about 5-7 minutes.',
    'Remove tofu and set aside. Add remaining oil to the wok.',
    'Stir-fry garlic and ginger for 30 seconds until fragrant. Add broccoli first, cook 2 minutes.',
    'Add bell peppers and snap peas. Stir-fry for 3-4 minutes until crisp-tender.',
    'Mix remaining soy sauce, sesame oil, rice vinegar, and 2 tbsp water. Pour over vegetables.',
    'Return tofu to wok. Toss everything together. Serve over rice, garnished with sesame seeds.'
  ]
WHERE title = 'Tofu Stir-fry';

-- Update Lemon Tart
UPDATE recipes SET
  description = 'Elegant French lemon tart with buttery crust and silky lemon curd',
  ingredients = ARRAY[
    '250g all-purpose flour',
    '125g cold unsalted butter (cubed)',
    '75g powdered sugar',
    '1 large egg yolk',
    '4 large eggs',
    '200g granulated sugar',
    '150ml fresh lemon juice (about 4 lemons)',
    'Zest of 2 lemons',
    '150ml heavy cream',
    'Powdered sugar for dusting'
  ],
  instructions = ARRAY[
    'For crust: Pulse flour, butter, and powdered sugar in food processor until sandy. Add yolk and pulse until dough forms.',
    'Press dough into a 9-inch tart pan with removable bottom. Refrigerate 30 minutes.',
    'Preheat oven to 375°F (190°C). Line crust with parchment and pie weights. Blind bake 15 minutes.',
    'Remove weights and parchment. Bake 10 more minutes until golden. Reduce oven to 325°F (165°C).',
    'For filling: Whisk eggs, sugar, lemon juice, and zest until smooth. Stir in cream.',
    'Pour filling into warm crust. Bake 25-30 minutes until just set with slight wobble in center.',
    'Cool completely at room temperature, then refrigerate at least 2 hours.',
    'Dust with powdered sugar before serving. Garnish with lemon zest curls if desired.'
  ]
WHERE title = 'Lemon Tart';

-- Update Pavlova
UPDATE recipes SET
  description = 'Light meringue dessert with crispy shell and marshmallow center',
  ingredients = ARRAY[
    '4 large egg whites (room temperature)',
    '250g caster sugar',
    '1 tsp white vinegar',
    '2 tsp cornstarch',
    '1 tsp vanilla extract',
    '300ml heavy whipping cream',
    '2 tbsp powdered sugar',
    '400g mixed fresh berries (strawberries, raspberries, blueberries)',
    'Fresh mint leaves for garnish',
    'Passion fruit pulp (optional)'
  ],
  instructions = ARRAY[
    'Preheat oven to 250°F (120°C). Draw an 8-inch circle on parchment paper and flip over on baking sheet.',
    'Beat egg whites on medium-high until soft peaks form. Gradually add sugar, 1 tbsp at a time.',
    'Continue beating until stiff, glossy peaks form and sugar is completely dissolved (about 8-10 minutes).',
    'Fold in vinegar, cornstarch, and vanilla extract gently with a spatula.',
    'Spread meringue onto the circle, creating a slight well in the center and raised edges.',
    'Bake for 90 minutes. Turn off oven and leave door ajar, letting pavlova cool inside for at least 1 hour.',
    'Whip cream with powdered sugar until soft peaks form. Spread over cooled pavlova.',
    'Arrange fresh berries on top. Drizzle with passion fruit pulp. Garnish with mint and serve immediately.'
  ]
WHERE title = 'Pavlova';

-- Update Bundt Cake
UPDATE recipes SET
  description = 'Moist and tender vanilla bundt cake with rich chocolate glaze',
  ingredients = ARRAY[
    '280g all-purpose flour',
    '2 tsp baking powder',
    '1/2 tsp salt',
    '225g unsalted butter (softened)',
    '350g granulated sugar',
    '4 large eggs',
    '2 tsp vanilla extract',
    '240ml buttermilk',
    '200g powdered sugar',
    '3 tbsp cocoa powder',
    '3 tbsp milk',
    '1 tbsp melted butter'
  ],
  instructions = ARRAY[
    'Preheat oven to 325°F (165°C). Generously butter and flour a 10-cup bundt pan.',
    'Whisk flour, baking powder, and salt together in a bowl. Set aside.',
    'Beat softened butter and sugar on medium-high for 5 minutes until light and fluffy.',
    'Add eggs one at a time, beating well after each addition. Mix in vanilla extract.',
    'Alternately add flour mixture and buttermilk in three additions, starting and ending with flour.',
    'Pour batter into prepared pan. Smooth top. Bake 55-65 minutes until toothpick comes out clean.',
    'Cool in pan 15 minutes, then invert onto a wire rack to cool completely.',
    'For glaze: Whisk powdered sugar, cocoa, milk, and melted butter. Drizzle over cooled cake.'
  ]
WHERE title = 'Bundt Cake';

-- Update Potato Salad
UPDATE recipes SET
  description = 'Creamy German-style potato salad with tangy mustard dressing',
  ingredients = ARRAY[
    '1kg waxy potatoes (Yukon Gold)',
    '200g thick-cut bacon',
    '1 medium onion (finely diced)',
    '120ml mayonnaise',
    '60ml sour cream',
    '2 tbsp whole-grain mustard',
    '2 tbsp apple cider vinegar',
    '3 stalks celery (diced)',
    '4 hard-boiled eggs (chopped)',
    '3 tbsp fresh chives (chopped)',
    '1 tsp salt',
    '1/2 tsp black pepper',
    '1 tsp smoked paprika'
  ],
  instructions = ARRAY[
    'Place whole potatoes in a large pot. Cover with cold water and 1 tbsp salt. Bring to boil.',
    'Reduce heat and simmer 20-25 minutes until fork-tender. Drain and cool until handleable.',
    'While potatoes cook, fry bacon until crispy. Remove and chop. Reserve 2 tbsp bacon fat.',
    'Sauté diced onion in reserved bacon fat until softened, about 5 minutes. Cool slightly.',
    'Peel potatoes (if desired) and cut into 3/4-inch cubes. Place in large bowl.',
    'Whisk mayonnaise, sour cream, mustard, and vinegar. Season with salt and pepper.',
    'Add celery, eggs, sautéed onion, and most of the bacon to potatoes. Pour dressing over.',
    'Fold gently to combine. Top with remaining bacon, chives, and paprika. Refrigerate 1 hour before serving.'
  ]
WHERE title = 'Potato Salad';

-- Update Niçoise Salad
UPDATE recipes SET
  description = 'Provençal composed salad with seared tuna, vegetables, and olives',
  ingredients = ARRAY[
    '300g fresh tuna steak (sashimi grade)',
    '200g green beans (trimmed)',
    '400g baby potatoes (halved)',
    '4 large eggs',
    '200g cherry tomatoes (halved)',
    '100g Niçoise olives',
    '1 head butter lettuce',
    '4 anchovy fillets',
    '80ml extra virgin olive oil',
    '2 tbsp red wine vinegar',
    '1 tbsp Dijon mustard',
    '1 clove garlic (minced)',
    '1 tbsp fresh tarragon (chopped)',
    'Salt and pepper to taste'
  ],
  instructions = ARRAY[
    'Boil potatoes in salted water until tender, about 15 minutes. Cool and halve if needed.',
    'Blanch green beans in boiling water 3 minutes until crisp-tender. Shock in ice water and drain.',
    'Boil eggs for exactly 7 minutes for jammy centers. Cool in ice water, then peel and halve.',
    'Season tuna steak generously with salt and pepper. Sear in hot oiled pan 1-2 minutes per side for rare.',
    'Whisk olive oil, red wine vinegar, Dijon mustard, garlic, and tarragon for dressing.',
    'Arrange butter lettuce leaves on a large platter as the base.',
    'Arrange potatoes, green beans, tomatoes, olives, and eggs in separate sections on the lettuce.',
    'Slice tuna and place in center. Lay anchovy fillets across top. Drizzle with dressing and serve.'
  ]
WHERE title = 'Niçoise Salad';

-- Update Tagliatelle Alfredo
UPDATE recipes SET
  description = 'Classic Italian pasta with rich parmesan cream sauce',
  ingredients = ARRAY[
    '400g fresh tagliatelle pasta',
    '150g unsalted butter',
    '300ml heavy cream',
    '200g Parmigiano-Reggiano (finely grated)',
    '3 cloves garlic (minced)',
    '1/4 tsp freshly grated nutmeg',
    '1/2 tsp salt',
    '1/4 tsp white pepper',
    '2 tbsp fresh parsley (chopped)',
    'Extra Parmesan for serving'
  ],
  instructions = ARRAY[
    'Bring a large pot of heavily salted water to a rolling boil.',
    'In a wide skillet, melt butter over medium heat. Add garlic and sauté 1 minute until fragrant.',
    'Pour in heavy cream and bring to a gentle simmer. Cook 3-4 minutes until slightly thickened.',
    'Meanwhile, cook tagliatelle according to package directions until al dente. Reserve 1 cup pasta water.',
    'Remove cream sauce from heat. Gradually whisk in grated Parmesan until smooth and creamy.',
    'Season with nutmeg, salt, and white pepper. Add drained pasta directly to the sauce.',
    'Toss vigorously, adding pasta water as needed to achieve silky consistency that coats the pasta.',
    'Divide among warm plates. Top with extra Parmesan and fresh parsley. Serve immediately.'
  ]
WHERE title = 'Tagliatelle Alfredo';

-- Update Cacio e Pepe
UPDATE recipes SET
  description = 'Roman pasta with sharp pecorino cheese and black pepper',
  ingredients = ARRAY[
    '400g spaghetti or tonnarelli',
    '200g Pecorino Romano (finely grated)',
    '2 tbsp whole black peppercorns',
    '2 tbsp extra virgin olive oil',
    'Salt for pasta water',
    '50g Parmesan (optional, for mellower flavor)'
  ],
  instructions = ARRAY[
    'Bring a large pot of moderately salted water to boil (less salt than usual - cheese is salty).',
    'Toast peppercorns in a dry pan over medium heat 2 minutes. Coarsely crush in a mortar or under a knife.',
    'In a large bowl, combine grated Pecorino with 2 tbsp olive oil. Mix to form a thick paste.',
    'Cook pasta 1 minute less than package directions for al dente. Reserve 2 cups pasta water before draining.',
    'Add 1 cup hot pasta water to the cheese paste. Whisk vigorously to create a smooth, creamy emulsion.',
    'Add drained pasta to a large cold pan. Pour cheese sauce over pasta.',
    'Turn heat to low. Toss vigorously for 1-2 minutes, adding more pasta water if sauce tightens.',
    'Add crushed pepper and toss again. Serve immediately on warm plates with extra cheese and pepper.'
  ]
WHERE title = 'Cacio e Pepe';

-- Update Mac and Cheese
UPDATE recipes SET
  description = 'Creamy baked macaroni with three-cheese sauce and crispy breadcrumb topping',
  ingredients = ARRAY[
    '450g elbow macaroni',
    '60g unsalted butter',
    '60g all-purpose flour',
    '1 liter whole milk (warm)',
    '300g sharp cheddar (grated)',
    '150g Gruyère (grated)',
    '100g cream cheese',
    '1 tsp Dijon mustard',
    '1/2 tsp cayenne pepper',
    '1 tsp salt',
    '1/2 tsp black pepper',
    '100g panko breadcrumbs',
    '3 tbsp melted butter',
    '2 tbsp fresh parsley (chopped)'
  ],
  instructions = ARRAY[
    'Preheat oven to 375°F (190°C). Butter a 9x13-inch baking dish.',
    'Cook macaroni 2 minutes less than package directions. Drain and set aside.',
    'Melt 60g butter in a large saucepan over medium heat. Whisk in flour and cook 2 minutes.',
    'Gradually add warm milk while whisking constantly. Simmer until thickened, about 5 minutes.',
    'Remove from heat. Stir in cheddar, Gruyère, cream cheese, mustard, cayenne, salt, and pepper.',
    'Fold in cooked macaroni. Pour into prepared baking dish and spread evenly.',
    'Mix panko with melted butter and parsley. Sprinkle evenly over the pasta.',
    'Bake 25-30 minutes until bubbling and golden brown on top. Rest 5 minutes before serving.'
  ]
WHERE title = 'Mac and Cheese';

-- Update Cream of Mushroom Soup
UPDATE recipes SET
  description = 'Velvety mushroom soup with fresh herbs and cream',
  ingredients = ARRAY[
    '500g mixed mushrooms (cremini, shiitake, button)',
    '60g unsalted butter',
    '1 large onion (diced)',
    '3 cloves garlic (minced)',
    '3 tbsp all-purpose flour',
    '1 liter vegetable or chicken stock',
    '250ml heavy cream',
    '2 sprigs fresh thyme',
    '1 bay leaf',
    '1/2 tsp salt',
    '1/4 tsp white pepper',
    '2 tbsp fresh parsley (chopped)',
    'Truffle oil for drizzling (optional)'
  ],
  instructions = ARRAY[
    'Clean mushrooms with a damp cloth. Slice 400g and finely dice remaining 100g for texture.',
    'Melt butter in a large pot over medium-high heat. Add sliced mushrooms and cook 8-10 minutes until golden.',
    'Add onion and cook 5 minutes until softened. Add garlic and cook 1 minute more.',
    'Sprinkle flour over mushrooms and stir to coat. Cook 2 minutes to eliminate raw flour taste.',
    'Gradually pour in stock while stirring. Add thyme and bay leaf. Simmer 20 minutes.',
    'Remove thyme stems and bay leaf. Blend half the soup until smooth, then return to pot.',
    'Stir in cream and diced mushrooms. Heat through without boiling. Season with salt and pepper.',
    'Ladle into warm bowls. Garnish with parsley and a drizzle of truffle oil if using.'
  ]
WHERE title = 'Cream of Mushroom Soup';

-- Update Chicken Paprikash
UPDATE recipes SET
  description = 'Hungarian braised chicken in rich paprika and sour cream sauce',
  ingredients = ARRAY[
    '1.5kg chicken thighs (bone-in, skin-on)',
    '3 tbsp Hungarian sweet paprika',
    '1 tbsp smoked paprika',
    '2 large onions (sliced)',
    '4 cloves garlic (minced)',
    '2 tbsp vegetable oil',
    '2 tbsp butter',
    '400ml chicken stock',
    '250ml sour cream',
    '2 tbsp all-purpose flour',
    '1 red bell pepper (sliced)',
    '1 tsp salt',
    '1/2 tsp black pepper',
    'Fresh parsley for garnish'
  ],
  instructions = ARRAY[
    'Pat chicken dry and season generously with salt, pepper, and 1 tbsp sweet paprika.',
    'Heat oil in a large Dutch oven over medium-high. Brown chicken on both sides, about 4 minutes per side. Remove.',
    'Reduce heat to medium. Add butter and onions. Cook 10-12 minutes until deeply caramelized.',
    'Add garlic and remaining paprika. Stir 1 minute until fragrant (do not burn paprika).',
    'Pour in chicken stock, scraping up browned bits. Add bell pepper and return chicken to pot.',
    'Cover and simmer 35-40 minutes until chicken is cooked through and tender.',
    'Whisk sour cream with flour. Remove pot from heat, stir in sour cream mixture.',
    'Return to low heat for 5 minutes to thicken (do not boil). Serve over egg noodles with parsley.'
  ]
WHERE title = 'Chicken Paprikash';

-- Update Aglio e Olio  
UPDATE recipes SET
  description = 'Simple Roman pasta with garlic, olive oil, and red pepper flakes',
  ingredients = ARRAY[
    '400g spaghetti',
    '120ml extra virgin olive oil',
    '8 cloves garlic (thinly sliced)',
    '1 tsp red pepper flakes',
    '1/2 cup fresh parsley (finely chopped)',
    '1 tsp salt',
    '50g Pecorino Romano (grated)',
    '1 lemon (zested)'
  ],
  instructions = ARRAY[
    'Bring a large pot of generously salted water to a rolling boil.',
    'Cook spaghetti according to package directions until al dente. Reserve 1.5 cups pasta water.',
    'While pasta cooks, heat olive oil in a large skillet over medium-low heat.',
    'Add sliced garlic and cook slowly for 3-4 minutes until light golden (not brown or it becomes bitter).',
    'Add red pepper flakes and cook 30 seconds until fragrant.',
    'Drain pasta and add directly to the skillet with 1/2 cup pasta water.',
    'Toss vigorously over medium heat, adding more water as needed until glossy and emulsified.',
    'Remove from heat. Add parsley and lemon zest, toss again. Serve with grated Pecorino.'
  ]
WHERE title = 'Aglio e Olio';