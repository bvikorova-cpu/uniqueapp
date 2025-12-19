-- Update Apple Pie with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Prepare the pie crust: Mix 2.5 cups flour with 1 tsp salt in a bowl. Cut in 1 cup cold butter until mixture resembles coarse crumbs.',
  '2. Add 6-8 tbsp ice water, one tablespoon at a time, mixing until dough comes together. Divide in half, wrap in plastic, refrigerate 1 hour.',
  '3. Peel, core, and slice 6-7 apples (Granny Smith or Honeycrisp work best) into 1/4-inch slices.',
  '4. Toss apple slices with 3/4 cup sugar, 2 tbsp flour, 1 tsp cinnamon, 1/4 tsp nutmeg, and pinch of salt.',
  '5. Roll out first dough half on floured surface to 12-inch circle. Transfer to 9-inch pie dish, pressing into edges.',
  '6. Pour apple filling into crust, dot with 2 tbsp butter pieces.',
  '7. Roll out second dough half, place over filling. Trim edges, crimp to seal. Cut 4-5 slits in top for steam.',
  '8. Brush top with beaten egg, sprinkle with sugar.',
  '9. Bake at 425°F (220°C) for 15 minutes, then reduce to 350°F (175°C) and bake 35-40 minutes until golden and bubbly.',
  '10. Cool at least 2 hours before serving to allow filling to set.'
] WHERE title = 'Apple Pie';

-- Update Apple Strudel with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Peel and core 4 large apples, slice thinly. Toss with 1/2 cup sugar, 1 tsp cinnamon, 1/4 cup raisins, and 2 tbsp lemon juice.',
  '2. Toast 1/2 cup breadcrumbs in 2 tbsp butter until golden. Set aside.',
  '3. Melt 1/2 cup butter for brushing the phyllo layers.',
  '4. Lay one phyllo sheet on clean kitchen towel. Brush generously with melted butter.',
  '5. Layer 5-6 more phyllo sheets, brushing each with butter.',
  '6. Sprinkle toasted breadcrumbs over phyllo, leaving 2-inch border on all sides.',
  '7. Spread apple mixture evenly over breadcrumbs.',
  '8. Using the towel to help, roll the strudel tightly from the long side, tucking in ends.',
  '9. Transfer seam-side down to parchment-lined baking sheet. Brush top with remaining butter.',
  '10. Bake at 375°F (190°C) for 35-40 minutes until golden brown and crispy.',
  '11. Dust with powdered sugar while warm. Serve with vanilla ice cream or whipped cream.'
] WHERE title = 'Apple Strudel';

-- Update Arrabiata with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Bring large pot of salted water to boil for pasta.',
  '2. Finely mince 4 cloves of garlic. Remove seeds from 2-3 dried red chilies (or use 1 tsp red pepper flakes).',
  '3. Heat 1/4 cup olive oil in large skillet over medium heat.',
  '4. Add garlic and chilies, sauté 1-2 minutes until garlic is golden (do not burn).',
  '5. Add one 28oz can crushed San Marzano tomatoes. Season with salt.',
  '6. Simmer sauce 15-20 minutes, stirring occasionally, until thickened.',
  '7. Meanwhile, cook 1 lb penne pasta until al dente (about 2 minutes less than package directions).',
  '8. Reserve 1 cup pasta water before draining.',
  '9. Add drained pasta directly to sauce. Toss well, adding pasta water as needed.',
  '10. Cook together 2 minutes until pasta absorbs some sauce.',
  '11. Remove from heat. Add fresh torn basil and drizzle with extra virgin olive oil.',
  '12. Serve immediately with freshly grated Pecorino Romano cheese.'
] WHERE title = 'Arrabiata';

-- Update Asian Slaw with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Finely shred 1/2 head green cabbage and 1/4 head red cabbage. Place in large bowl.',
  '2. Julienne 2 carrots and 1 red bell pepper into thin matchsticks.',
  '3. Thinly slice 4 green onions on the diagonal. Add all vegetables to bowl.',
  '4. For dressing: whisk together 3 tbsp rice vinegar, 2 tbsp soy sauce, 1 tbsp sesame oil, 1 tbsp honey.',
  '5. Add 1 tbsp grated fresh ginger and 1 minced garlic clove to dressing.',
  '6. Pour dressing over vegetables and toss well to combine.',
  '7. Let sit 10-15 minutes for flavors to meld and cabbage to soften slightly.',
  '8. Toast 2 tbsp sesame seeds in dry pan until golden.',
  '9. Just before serving, add 1/4 cup chopped fresh cilantro and toasted sesame seeds.',
  '10. Toss again and serve. Keeps refrigerated up to 2 days.'
] WHERE title = 'Asian Slaw';