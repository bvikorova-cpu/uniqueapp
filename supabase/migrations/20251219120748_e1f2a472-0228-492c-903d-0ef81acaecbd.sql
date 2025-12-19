-- Update Bolognese with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Finely dice 1 onion, 2 carrots, 2 celery stalks (this is called soffritto). Process or chop very fine.',
  '2. Heat 2 tbsp olive oil and 2 tbsp butter in large heavy pot over medium heat.',
  '3. Add soffritto, cook gently 10-15 minutes until soft and golden, not browned.',
  '4. Increase heat to medium-high. Add 1 lb ground beef and 1/2 lb ground pork.',
  '5. Break up meat with wooden spoon. Cook until no longer pink, about 8 minutes.',
  '6. Season with salt and pepper. Add 1/2 cup dry white wine.',
  '7. Cook until wine evaporates completely, stirring occasionally.',
  '8. Add 1 cup whole milk. Simmer until milk is absorbed (this tenderizes the meat).',
  '9. Add one 28 oz can crushed San Marzano tomatoes, 1/2 cup beef or chicken stock.',
  '10. Add pinch of nutmeg, 1 bay leaf, 2 sprigs fresh thyme.',
  '11. Reduce heat to very low. Simmer uncovered 3-4 hours, stirring occasionally.',
  '12. Add small amounts of stock if sauce becomes too thick.',
  '13. The finished sauce should be rich, meaty, and coating consistency - not watery.',
  '14. Serve over fresh tagliatelle or pappardelle with freshly grated Parmigiano-Reggiano.'
] WHERE title = 'Bolognese';

-- Update Lasagna with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Prepare Bolognese sauce according to recipe, or use 4 cups prepared meat sauce.',
  '2. Make béchamel: Melt 4 tbsp butter in saucepan. Whisk in 1/4 cup flour, cook 2 minutes.',
  '3. Gradually add 3 cups warm milk, whisking constantly to prevent lumps.',
  '4. Simmer until thickened, about 8 minutes. Season with salt, pepper, pinch of nutmeg.',
  '5. Preheat oven to 375°F (190°C). Grease 9x13 inch baking dish.',
  '6. If using dry lasagna noodles, cook according to package until just al dente. Drain and lay flat.',
  '7. Spread thin layer of meat sauce on bottom of dish.',
  '8. Layer: pasta sheets, meat sauce, béchamel, 1/3 cup grated Parmesan. Repeat 3-4 times.',
  '9. Top final layer with remaining béchamel and generous Parmesan.',
  '10. Optional: dot with 2 tbsp butter for golden top.',
  '11. Cover tightly with foil. Bake 25 minutes.',
  '12. Remove foil, bake additional 20-25 minutes until bubbly and top is golden.',
  '13. Rest 15-20 minutes before cutting - this is essential for clean slices!',
  '14. Garnish with fresh basil. Serve with extra Parmesan on the side.'
] WHERE title = 'Lasagna';

-- Update Cheesecake with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Preheat oven to 325°F (165°C). Wrap outside of 9-inch springform pan with foil to prevent leaks.',
  '2. Crush 2 cups graham crackers into fine crumbs. Mix with 6 tbsp melted butter and 3 tbsp sugar.',
  '3. Press crumb mixture firmly into bottom and 1 inch up sides of pan.',
  '4. Bake crust 10 minutes. Cool completely.',
  '5. Beat 4 packages (32 oz) room-temperature cream cheese until smooth - no lumps!',
  '6. Add 1.25 cups sugar gradually, beat until fluffy.',
  '7. Add 4 eggs one at a time, beating just until combined after each.',
  '8. Mix in 1 cup sour cream, 2 tsp vanilla extract, 1 tbsp lemon juice.',
  '9. Pour filling over cooled crust. Smooth top.',
  '10. Place springform pan in larger roasting pan. Add hot water halfway up sides (water bath).',
  '11. Bake 55-70 minutes until edges are set but center still jiggles slightly.',
  '12. Turn off oven, crack door open. Let cheesecake cool in oven 1 hour.',
  '13. Remove from water bath. Refrigerate at least 4 hours, preferably overnight.',
  '14. Run knife around edge before removing springform ring. Top with fresh berries if desired.'
] WHERE title = 'Cheesecake';

-- Update Chocolate Cake with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.',
  '2. Sift together 2 cups flour, 2 cups sugar, 3/4 cup cocoa powder, 2 tsp baking soda, 1 tsp salt.',
  '3. In large bowl, whisk 2 eggs, 1 cup buttermilk, 1 cup hot coffee, 1/2 cup vegetable oil, 2 tsp vanilla.',
  '4. Add dry ingredients to wet. Mix until just combined - batter will be thin.',
  '5. Divide batter evenly between pans.',
  '6. Bake 30-35 minutes until toothpick inserted in center comes out clean.',
  '7. Cool in pans 10 minutes, then turn out onto wire racks. Cool completely.',
  '8. For frosting: Beat 1 cup softened butter until creamy.',
  '9. Add 3/4 cup cocoa powder, 4 cups powdered sugar alternating with 1/2 cup milk.',
  '10. Add 2 tsp vanilla. Beat until fluffy, about 3 minutes.',
  '11. Place one cake layer on serving plate. Spread 1 cup frosting on top.',
  '12. Place second layer on top. Frost top and sides with remaining frosting.',
  '13. For smooth finish, use offset spatula dipped in hot water.',
  '14. Decorate with chocolate shavings or ganache drizzle if desired.'
] WHERE title = 'Chocolate Cake';