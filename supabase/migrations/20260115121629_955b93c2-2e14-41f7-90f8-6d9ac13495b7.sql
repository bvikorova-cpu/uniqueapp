-- Update Garlic Bread with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['1 large baguette or Italian bread', '120g unsalted butter (softened)', '4 cloves garlic (minced)', '2 tbsp fresh parsley (finely chopped)', '1/4 tsp salt', 'Pinch of black pepper', '2 tbsp grated Parmesan (optional)'],
  instructions = ARRAY[
    '1. Preheat your oven to 200°C (400°F) and position rack in the middle.',
    '2. In a small bowl, combine softened butter with minced garlic, parsley, salt, and pepper. Mix until well combined.',
    '3. Cut the baguette in half lengthwise, then slice each half into 2-inch pieces (or leave halves whole for pull-apart bread).',
    '4. Generously spread the garlic butter mixture on the cut side of each bread piece, ensuring even coverage.',
    '5. If using, sprinkle grated Parmesan cheese evenly over the buttered bread.',
    '6. Place bread pieces on a baking sheet lined with parchment paper, butter side up.',
    '7. Bake for 10-12 minutes until edges are golden and crispy, and the butter is bubbling.',
    '8. For extra crispiness, broil for 1-2 minutes (watch carefully to prevent burning).',
    '9. Remove from oven and let cool for 2 minutes. Serve warm immediately for best taste.'
  ]
WHERE id = 'd2834845-c9fa-46e7-8a61-3f8c0e990432';

-- Update Tzatziki with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['500g Greek yogurt (full-fat)', '1 large cucumber', '4 cloves garlic (minced)', '2 tbsp extra virgin olive oil', '1 tbsp fresh lemon juice', '2 tbsp fresh dill (chopped)', '1/2 tsp salt', '1/4 tsp white pepper'],
  instructions = ARRAY[
    '1. Peel the cucumber and grate using a box grater. Place in a fine-mesh sieve over a bowl.',
    '2. Sprinkle grated cucumber with 1/2 tsp salt, mix well, and let drain for 20-30 minutes.',
    '3. After draining, squeeze the cucumber firmly with your hands or in a clean kitchen towel to remove excess moisture.',
    '4. In a medium bowl, combine Greek yogurt with the drained cucumber.',
    '5. Add minced garlic, olive oil, lemon juice, and chopped dill. Mix well.',
    '6. Season with remaining salt and white pepper. Taste and adjust seasoning as needed.',
    '7. Cover and refrigerate for at least 1 hour to allow flavors to meld together.',
    '8. Before serving, drizzle with extra olive oil and garnish with fresh dill.',
    '9. Serve cold with warm pita bread, vegetables, or as a sauce for grilled meats. Keeps refrigerated for 3-4 days.'
  ]
WHERE id = '1abb3dbf-a0f2-4256-ac61-96af005b8511';

-- Update Feta Salad with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['200g mixed salad greens', '150g feta cheese (cubed)', '100g Kalamata olives', '1 large cucumber (diced)', '2 medium tomatoes (wedged)', '1/2 red onion (thinly sliced)', '1 tbsp dried oregano', '4 tbsp extra virgin olive oil', '2 tbsp red wine vinegar', 'Salt and pepper to taste'],
  instructions = ARRAY[
    '1. Wash and dry the mixed salad greens thoroughly. Place in a large salad bowl.',
    '2. Dice the cucumber into 1cm cubes and add to the bowl.',
    '3. Cut tomatoes into wedges and add to the greens.',
    '4. Thinly slice the red onion into half-moons and scatter over the vegetables.',
    '5. Add the Kalamata olives, distributing evenly throughout the salad.',
    '6. Cut feta cheese into 2cm cubes and place on top of the salad.',
    '7. In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.',
    '8. Drizzle the dressing over the salad just before serving.',
    '9. Toss gently to combine, being careful not to break up the feta. Serve immediately.'
  ]
WHERE id = '5169abf5-aa08-4861-9db3-53e94218a916';

-- Update Spring Mix with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['200g mixed spring greens', '6-8 radishes (thinly sliced)', '1 cucumber (diced)', '3 spring onions (chopped)', '100g cherry tomatoes (halved)', '3 tbsp balsamic vinegar', '5 tbsp extra virgin olive oil', '1 tsp Dijon mustard', '1 tsp honey', 'Salt and pepper to taste', 'Fresh herbs (optional)'],
  instructions = ARRAY[
    '1. Wash all vegetables thoroughly and pat dry with paper towels or use a salad spinner.',
    '2. Place spring greens in a large serving bowl as the base.',
    '3. Slice radishes into thin rounds using a mandoline or sharp knife for uniform thickness.',
    '4. Dice the cucumber into bite-sized pieces and add to the bowl.',
    '5. Slice spring onions, using both white and green parts, and scatter over the salad.',
    '6. Halve the cherry tomatoes and add them to the mix.',
    '7. For the dressing: whisk together balsamic vinegar, olive oil, Dijon mustard, and honey until emulsified.',
    '8. Season dressing with salt and pepper to taste.',
    '9. Drizzle dressing over the salad just before serving. Toss gently and serve immediately.'
  ]
WHERE id = '7a1c3203-e7e0-4054-a43a-97ce81d85565';

-- Update Bundt Cake with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['300g all-purpose flour', '200g granulated sugar', '4 large eggs (room temperature)', '200ml whole milk', '150g unsalted butter (melted)', '30g cocoa powder', '2 tsp baking powder', '1 tsp vanilla extract', '1/4 tsp salt', 'Powdered sugar for dusting'],
  instructions = ARRAY[
    '1. Preheat oven to 175°C (350°F). Generously grease and flour a bundt pan, making sure to coat all crevices.',
    '2. In a large bowl, sift together flour, cocoa powder, baking powder, and salt.',
    '3. In another bowl, whisk eggs with sugar until light and fluffy, about 3-4 minutes.',
    '4. Add melted butter and vanilla extract to the egg mixture and stir to combine.',
    '5. Gradually add the dry ingredients to the wet mixture, alternating with milk in 3 additions.',
    '6. Mix until just combined - do not overmix or the cake will be dense.',
    '7. Pour batter into prepared bundt pan and spread evenly. Tap pan gently to release air bubbles.',
    '8. Bake for 45-55 minutes until a toothpick inserted comes out clean.',
    '9. Let cool in pan for 15 minutes, then invert onto a wire rack to cool completely.',
    '10. Dust with powdered sugar before serving. Store covered at room temperature for up to 3 days.'
  ],
  time = '1 hr 15 min'
WHERE id = '72825f74-0517-4dd4-af68-e28414d04d24';

-- Update Hot Chocolate with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['400ml whole milk', '100g dark chocolate (70% cocoa, chopped)', '2 tbsp unsweetened cocoa powder', '2 tbsp granulated sugar', '1/4 tsp vanilla extract', 'Pinch of salt', 'Whipped cream for topping', 'Chocolate shavings (optional)', 'Mini marshmallows (optional)'],
  instructions = ARRAY[
    '1. Chop the dark chocolate into small pieces for easier melting.',
    '2. In a small saucepan, whisk together cocoa powder and sugar to remove any lumps.',
    '3. Add about 50ml of milk to the cocoa mixture and whisk to create a smooth paste.',
    '4. Pour in the remaining milk and place over medium heat.',
    '5. Heat while stirring constantly, until the milk begins to steam (do not boil).',
    '6. Add the chopped chocolate and continue stirring until completely melted and smooth.',
    '7. Stir in vanilla extract and a pinch of salt to enhance the chocolate flavor.',
    '8. Pour the hot chocolate into warmed mugs.',
    '9. Top generously with whipped cream and chocolate shavings or marshmallows. Serve immediately.'
  ]
WHERE id = '99c8240f-47f9-44a1-ace8-79ff46edb92d';

-- Update Iced Coffee with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['2 shots espresso (60ml) or 120ml strong brewed coffee', '200ml whole milk or oat milk', 'Ice cubes (about 1 cup)', '2 tbsp vanilla syrup or simple syrup', '1 tbsp chocolate sauce (optional)', 'Whipped cream (optional)'],
  instructions = ARRAY[
    '1. Brew 2 shots of espresso using an espresso machine. Alternatively, brew 120ml of extra-strong coffee.',
    '2. Let the coffee cool to room temperature, then refrigerate for 10 minutes or until cold.',
    '3. Fill a tall glass with ice cubes, filling it about 3/4 full.',
    '4. If using chocolate sauce, drizzle it around the inside of the glass for a mocha effect.',
    '5. Pour the cold espresso over the ice.',
    '6. Add your preferred amount of vanilla syrup and stir to combine.',
    '7. Slowly pour cold milk over the coffee, creating a layered effect.',
    '8. Stir gently to combine, or leave layered for presentation.',
    '9. Top with whipped cream if desired. Add a straw and serve immediately while cold.'
  ]
WHERE id = '2b083ad9-0c09-4e14-8296-90f9ccdd682b';

-- Update Ginger Tea with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['5cm piece fresh ginger root', '2 tbsp raw honey', '1 lemon (juiced)', '500ml filtered water', '1 cinnamon stick (optional)', '2-3 whole cloves (optional)', 'Fresh mint leaves (optional)'],
  instructions = ARRAY[
    '1. Wash and peel the fresh ginger root. Slice into thin coins or grate for more intense flavor.',
    '2. Bring 500ml of water to a boil in a small saucepan.',
    '3. Add the ginger slices to the boiling water. Reduce heat and simmer for 10-15 minutes.',
    '4. For spiced version, add cinnamon stick and cloves during simmering.',
    '5. Remove from heat and let steep for an additional 5 minutes.',
    '6. Strain the tea through a fine-mesh sieve into cups.',
    '7. Let cool slightly until drinkable temperature (honey loses benefits in very hot liquid).',
    '8. Add honey and freshly squeezed lemon juice. Stir well to combine.',
    '9. Garnish with fresh mint leaves if desired. Serve warm for sore throat relief or chill for a refreshing drink.'
  ]
WHERE id = 'd48e626a-7fa2-4c63-b65a-d409dc3b3515';

-- Update Green Smoothie with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['2 cups fresh baby spinach', '1 ripe banana (frozen works best)', '1 green apple (cored and chopped)', '1/2 cucumber (peeled)', '1 tbsp fresh lemon juice', '250ml cold water or coconut water', '1 tbsp honey or maple syrup (optional)', 'Ice cubes (if using fresh banana)'],
  instructions = ARRAY[
    '1. Wash spinach and cucumber thoroughly. Pat dry with paper towels.',
    '2. Core the apple and cut into chunks (no need to peel for extra fiber).',
    '3. Peel and slice the banana. For best results, use a frozen banana for creamier texture.',
    '4. Add spinach to the blender first (this helps it blend more evenly).',
    '5. Add banana, apple chunks, and cucumber pieces.',
    '6. Pour in lemon juice and water or coconut water.',
    '7. Add honey or maple syrup if you prefer a sweeter smoothie.',
    '8. Blend on high speed for 60-90 seconds until completely smooth.',
    '9. Pour into a tall glass and serve immediately for maximum nutritional benefit.'
  ]
WHERE id = '35fc5e13-1cb7-445c-87d9-95f8afdd0776';

-- Update Marinara Pizza with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['1 prepared pizza dough (250g)', '200g San Marzano tomato sauce', '4 cloves garlic (thinly sliced)', '3 tbsp extra virgin olive oil', '1 tsp dried oregano', '1/2 tsp sea salt', 'Fresh basil leaves', 'Red pepper flakes (optional)'],
  instructions = ARRAY[
    '1. Preheat oven to its highest setting (usually 250°C/500°F) with a pizza stone or baking sheet inside.',
    '2. Remove pizza dough from refrigerator 30 minutes before use to reach room temperature.',
    '3. On a floured surface, stretch the dough into a 12-inch circle using your hands (not a rolling pin).',
    '4. Transfer dough to a piece of parchment paper or a floured pizza peel.',
    '5. Spread tomato sauce evenly over the dough, leaving a 1-inch border for the crust.',
    '6. Scatter thin garlic slices evenly over the sauce.',
    '7. Drizzle generously with olive oil and sprinkle with oregano and salt.',
    '8. Slide pizza onto the preheated stone and bake for 8-12 minutes until crust is golden and charred in spots.',
    '9. Remove from oven, top with fresh basil leaves and red pepper flakes. Slice and serve immediately.'
  ]
WHERE id = '19015d06-be7b-4ea9-93b4-7208c877b7c0';

-- Update Protein Shake with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['1 scoop (30g) vanilla or chocolate protein powder', '1 ripe banana', '250ml whole milk or almond milk', '2 tbsp natural peanut butter', '30g rolled oats', '1 tbsp honey (optional)', 'Ice cubes', '1/2 tsp cinnamon (optional)'],
  instructions = ARRAY[
    '1. Add oats to the blender first and pulse briefly to break them down slightly.',
    '2. Peel and break the banana into chunks, add to blender.',
    '3. Add protein powder, peanut butter, and cinnamon if using.',
    '4. Pour in cold milk.',
    '5. Add honey if you prefer a sweeter shake.',
    '6. Add 4-5 ice cubes for a thicker, colder shake.',
    '7. Blend on high speed for 45-60 seconds until completely smooth and creamy.',
    '8. Pour into a large glass or shaker bottle.',
    '9. Consume within 30 minutes of making for best nutritional value. Perfect post-workout or as breakfast.'
  ]
WHERE id = '104065c3-feea-45e9-b33a-1cad60673195';

-- Update Lemonade with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['6 large lemons', '150g granulated sugar', '1 liter cold filtered water', '500ml hot water (for syrup)', 'Fresh mint leaves', 'Ice cubes', 'Lemon slices for garnish'],
  instructions = ARRAY[
    '1. Roll the lemons on the counter while pressing down to release more juice.',
    '2. Cut lemons in half and juice them using a citrus juicer. Strain to remove seeds (you need about 250ml juice).',
    '3. Make simple syrup: dissolve sugar in 500ml hot water, stirring until completely dissolved. Let cool.',
    '4. In a large pitcher, combine the fresh lemon juice with the cooled simple syrup.',
    '5. Add 1 liter of cold water and stir well to combine.',
    '6. Taste and adjust sweetness by adding more water or sugar as needed.',
    '7. Refrigerate for at least 1 hour until well chilled.',
    '8. Fill glasses with ice cubes and pour the lemonade over.',
    '9. Garnish with fresh mint leaves and lemon slices. Serve immediately.'
  ]
WHERE id = '869c4b93-bc61-495c-852f-6282ed618f11';

-- Update Tofu Stir-fry with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['400g extra-firm tofu', '2 cups mixed vegetables (broccoli, bell peppers, snap peas)', '3 tbsp soy sauce', '1 tbsp sesame oil', '4 cloves garlic (minced)', '1 tbsp fresh ginger (grated)', '2 tbsp vegetable oil', '1 tbsp cornstarch', '1 tsp sriracha or chili sauce', 'Sesame seeds for garnish', 'Cooked rice for serving'],
  instructions = ARRAY[
    '1. Press tofu: wrap in paper towels, place heavy object on top for 20-30 minutes to remove moisture.',
    '2. Cut pressed tofu into 1-inch cubes and toss with cornstarch until lightly coated.',
    '3. Prepare vegetables: cut broccoli into florets, slice bell peppers, trim snap peas.',
    '4. Heat vegetable oil in a large wok or skillet over high heat until smoking.',
    '5. Add tofu in a single layer and fry without stirring for 3-4 minutes until golden on bottom.',
    '6. Flip tofu and cook another 2-3 minutes. Remove and set aside.',
    '7. Add sesame oil to the pan, then add garlic and ginger. Stir-fry for 30 seconds until fragrant.',
    '8. Add vegetables and stir-fry for 4-5 minutes until crisp-tender.',
    '9. Return tofu to pan, add soy sauce and sriracha. Toss to coat. Serve over rice with sesame seeds.'
  ]
WHERE id = 'a9f9167b-667f-46bf-a953-5d12b4a941be';

-- Update Pavlova with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['4 large egg whites (room temperature)', '250g caster sugar', '1 tsp white wine vinegar', '1 tsp vanilla extract', '2 tsp cornstarch', '300ml heavy cream', '300g mixed fresh berries', 'Fresh mint for garnish'],
  instructions = ARRAY[
    '1. Preheat oven to 120°C (250°F). Line a baking sheet with parchment paper.',
    '2. Using an electric mixer, beat egg whites until soft peaks form.',
    '3. Gradually add sugar, one tablespoon at a time, beating well after each addition until stiff and glossy.',
    '4. The meringue should be smooth and shiny. Rub between fingers to check sugar is dissolved.',
    '5. Gently fold in vinegar, vanilla, and cornstarch.',
    '6. Spoon meringue onto parchment, shaping into a circle about 20cm across with slightly raised edges.',
    '7. Bake for 1 hour 15 minutes. Turn off oven and leave pavlova inside with door ajar until completely cool.',
    '8. Just before serving, whip cream until soft peaks form.',
    '9. Top cooled pavlova with whipped cream and arrange fresh berries on top. Garnish with mint.'
  ],
  time = '1 hr 30 min'
WHERE id = 'fb1e8970-707b-41ee-bb16-031b8e0816be';

-- Update Lemon Tart with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['1 pre-baked tart shell (23cm)', '4 large lemons (zest and juice)', '4 large eggs', '200g caster sugar', '150g unsalted butter (cubed)', 'Pinch of salt', 'Powdered sugar for dusting', 'Whipped cream for serving'],
  instructions = ARRAY[
    '1. Zest all 4 lemons, then juice them to get approximately 150ml of fresh lemon juice.',
    '2. In a heatproof bowl, whisk together eggs and sugar until well combined.',
    '3. Add lemon juice, lemon zest, and a pinch of salt. Whisk to combine.',
    '4. Place bowl over a pot of simmering water (double boiler method).',
    '5. Cook while stirring constantly for 10-15 minutes until mixture thickens and coats the back of a spoon.',
    '6. Remove from heat and stir in butter, one cube at a time, until fully incorporated and glossy.',
    '7. Strain the curd through a fine-mesh sieve into the pre-baked tart shell.',
    '8. Refrigerate for at least 4 hours, preferably overnight, until completely set.',
    '9. Before serving, dust with powdered sugar and serve with a dollop of whipped cream.'
  ],
  time = '4 hrs 30 min'
WHERE id = 'e8c59f28-b115-4ad4-87d9-4244ace66d2c';

-- Update Potato Salad with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['1kg waxy potatoes (Yukon Gold or Red)', '150g mayonnaise', '2 tbsp Dijon mustard', '2 stalks celery (diced)', '1/2 red onion (finely diced)', '4 hard-boiled eggs', '2 tbsp apple cider vinegar', '2 tbsp fresh dill (chopped)', 'Salt and pepper to taste', 'Paprika for garnish'],
  instructions = ARRAY[
    '1. Place whole potatoes in a large pot, cover with cold water, add 1 tbsp salt. Bring to boil.',
    '2. Cook for 20-25 minutes until fork-tender but not falling apart. Drain and cool slightly.',
    '3. While still warm, peel potatoes (skin slides off easily) and cut into 2cm cubes.',
    '4. Hard boil eggs: place in cold water, bring to boil, remove from heat, cover for 12 minutes.',
    '5. Dice celery and red onion finely. Chop the hard-boiled eggs.',
    '6. In a small bowl, whisk together mayonnaise, mustard, vinegar, salt, and pepper.',
    '7. In a large bowl, gently combine warm potatoes with the dressing while potatoes absorb flavor.',
    '8. Fold in celery, onion, eggs, and fresh dill. Adjust seasoning.',
    '9. Cover and refrigerate for at least 2 hours. Sprinkle with paprika before serving.'
  ],
  time = '2 hrs 45 min'
WHERE id = 'b23cfd78-edba-4dcb-86a8-d7603bcb53d3';

-- Update Niçoise Salad with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['200g canned tuna (in olive oil)', '300g green beans (trimmed)', '400g small potatoes', '4 hard-boiled eggs (quartered)', '100g Kalamata olives', '50g anchovy fillets', '200g cherry tomatoes (halved)', '1 head butter lettuce', '6 tbsp olive oil', '2 tbsp red wine vinegar', 'Dijon mustard', 'Salt and pepper'],
  instructions = ARRAY[
    '1. Boil potatoes in salted water for 15-20 minutes until tender. Drain, cool, and quarter.',
    '2. Blanch green beans in boiling salted water for 3-4 minutes until crisp-tender.',
    '3. Immediately transfer beans to ice water to stop cooking and preserve bright color. Drain.',
    '4. Make vinaigrette: whisk olive oil, vinegar, 1 tsp Dijon mustard, salt, and pepper.',
    '5. Arrange butter lettuce leaves on a large platter as the base.',
    '6. Arrange potatoes, green beans, and cherry tomatoes in sections over the lettuce.',
    '7. Drain tuna and flake into large chunks. Place in the center of the platter.',
    '8. Add quartered eggs, olives, and anchovy fillets around the tuna.',
    '9. Drizzle vinaigrette over the entire salad. Serve immediately at room temperature.'
  ]
WHERE id = '20dc764b-1dc6-40c0-8346-3d9352af3f8e';

-- Update Tagliatelle Alfredo with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['400g fresh tagliatelle pasta', '100g unsalted butter', '300ml heavy cream', '150g freshly grated Parmesan cheese', '4 cloves garlic (minced)', '1/4 tsp freshly grated nutmeg', 'Salt and white pepper to taste', 'Fresh parsley for garnish'],
  instructions = ARRAY[
    '1. Bring a large pot of generously salted water to boil for the pasta.',
    '2. In a large skillet, melt butter over medium-low heat.',
    '3. Add minced garlic and sauté for 1-2 minutes until fragrant but not browned.',
    '4. Pour in heavy cream and bring to a gentle simmer. Cook for 3-4 minutes until slightly thickened.',
    '5. Meanwhile, cook tagliatelle according to package directions until al dente. Reserve 1 cup pasta water.',
    '6. Reduce heat to low and gradually whisk Parmesan into the cream sauce until melted and smooth.',
    '7. Add nutmeg, salt, and white pepper to taste.',
    '8. Drain pasta and add directly to the sauce. Toss to coat, adding pasta water if needed for consistency.',
    '9. Serve immediately in warm bowls, garnished with extra Parmesan and fresh parsley.'
  ]
WHERE id = '42427b33-d6d8-454f-ab0c-eb6c3fe5baab';

-- Update Cacio e Pepe with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['400g spaghetti or tonnarelli', '200g Pecorino Romano cheese (finely grated)', '2 tsp freshly cracked black pepper', '2 tbsp extra virgin olive oil', 'Kosher salt for pasta water'],
  instructions = ARRAY[
    '1. Bring a large pot of water to boil. Add salt sparingly (Pecorino is very salty).',
    '2. Toast black pepper in a large dry skillet over medium heat for 1-2 minutes until fragrant.',
    '3. Add olive oil to the pepper and remove pan from heat.',
    '4. Cook pasta until very al dente (2 minutes less than package directions).',
    '5. Reserve 2 cups of starchy pasta water before draining.',
    '6. Add 1 cup pasta water to the pepper pan and bring to a simmer.',
    '7. Transfer pasta directly to the pan. Toss vigorously over low heat.',
    '8. Remove from heat completely. Add cheese gradually while tossing constantly to create creamy emulsion.',
    '9. Add more pasta water as needed. The sauce should cling to pasta without being gluey. Serve immediately.'
  ]
WHERE id = '6c24b36c-43a2-47ae-ba0a-fc78bd596896';

-- Update Mac and Cheese with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['400g elbow macaroni', '300g sharp cheddar cheese (shredded)', '100g gruyere cheese (shredded)', '60g unsalted butter', '45g all-purpose flour', '600ml whole milk', '1/4 tsp cayenne pepper', '1/2 tsp dry mustard', 'Salt and pepper to taste', '50g breadcrumbs for topping'],
  instructions = ARRAY[
    '1. Preheat oven to 190°C (375°F). Cook macaroni until just barely al dente. Drain and set aside.',
    '2. In a large saucepan, melt butter over medium heat.',
    '3. Whisk in flour and cook for 1-2 minutes to make a roux (do not brown).',
    '4. Gradually whisk in milk, ensuring no lumps form. Cook until sauce thickens, about 5-7 minutes.',
    '5. Remove from heat. Add cayenne, dry mustard, salt, and pepper.',
    '6. Stir in shredded cheeses until completely melted and sauce is smooth.',
    '7. Fold in the cooked macaroni until well coated with cheese sauce.',
    '8. Transfer to a greased 9x13 inch baking dish. Top with breadcrumbs and dots of butter.',
    '9. Bake for 25-30 minutes until bubbling and golden brown on top. Let rest 5 minutes before serving.'
  ],
  time = '50 min'
WHERE id = '9139eba6-a20e-4504-bc06-cda583202c2b';

-- Update Cream of Mushroom Soup with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['500g mixed mushrooms (cremini, shiitake, button)', '1 large onion (diced)', '4 cloves garlic (minced)', '250ml heavy cream', '750ml vegetable or chicken broth', '2 tbsp butter', '2 tbsp olive oil', '2 tbsp fresh thyme leaves', '2 tbsp all-purpose flour', 'Salt and pepper to taste', 'Truffle oil for drizzling (optional)'],
  instructions = ARRAY[
    '1. Clean mushrooms with a damp paper towel. Slice half thinly, roughly chop the other half.',
    '2. Heat butter and olive oil in a large pot over medium-high heat.',
    '3. Add half the mushrooms and cook without stirring for 3-4 minutes to develop golden brown color.',
    '4. Add remaining mushrooms and cook for another 5 minutes. Remove and set aside 1/2 cup for garnish.',
    '5. Add onion to the pot and sauté for 5 minutes until softened. Add garlic and cook 1 minute more.',
    '6. Sprinkle flour over vegetables and stir for 1 minute.',
    '7. Pour in broth, add thyme, and bring to a boil. Simmer for 15 minutes.',
    '8. Blend soup until smooth using an immersion blender. Stir in cream and heat through.',
    '9. Season with salt and pepper. Serve topped with reserved mushrooms and a drizzle of truffle oil.'
  ]
WHERE id = 'ece560aa-6bf7-4574-ba40-397aa0449491';

-- Update Chicken Paprikash with complete instructions and ingredients
UPDATE public.recipes SET 
  ingredients = ARRAY['1kg chicken pieces (thighs and drumsticks)', '2 large onions (diced)', '3 tbsp Hungarian sweet paprika', '250ml sour cream', '2 bell peppers (red and green, sliced)', '2 tomatoes (diced)', '3 tbsp vegetable oil', '2 cloves garlic (minced)', '250ml chicken broth', 'Salt and pepper to taste', 'Fresh parsley for garnish'],
  instructions = ARRAY[
    '1. Season chicken pieces generously with salt and pepper.',
    '2. Heat oil in a large Dutch oven over medium-high heat. Brown chicken on all sides, about 4 minutes per side. Remove and set aside.',
    '3. Reduce heat to medium. Add onions and cook for 8-10 minutes until soft and golden.',
    '4. Remove from heat and stir in paprika quickly (paprika can burn and become bitter).',
    '5. Add garlic, tomatoes, and bell peppers. Return to heat and cook for 3 minutes.',
    '6. Return chicken to the pot and add chicken broth. Cover and simmer for 30-35 minutes.',
    '7. Remove chicken to a platter. Reduce heat to low.',
    '8. Temper sour cream by adding a few spoonfuls of hot liquid to it, then stir into the sauce.',
    '9. Return chicken to sauce briefly to coat. Serve over egg noodles or spätzle, garnished with parsley.'
  ],
  time = '55 min'
WHERE id = '0ae460db-522c-49ca-877c-fc9cc2ccfc45';