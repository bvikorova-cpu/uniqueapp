-- Update Sushi with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Rinse 2 cups sushi rice under cold water until water runs clear (about 5 rinses).',
  '2. Cook rice with 2 cups water in rice cooker or pot. Let it rest 10 minutes after cooking.',
  '3. Make sushi vinegar: heat 1/4 cup rice vinegar, 2 tbsp sugar, 1 tsp salt until dissolved. Cool.',
  '4. Transfer hot rice to large wooden bowl (hangiri) or glass bowl.',
  '5. Pour vinegar over rice while fanning to cool. Gently fold - don''t mash! Rice should be glossy.',
  '6. Cover with damp cloth. Use within 2 hours at room temperature.',
  '7. Prepare fish: Use sushi-grade salmon, tuna, or yellowtail. Slice against grain into thin pieces.',
  '8. For nigiri: wet hands with vinegar water. Form 1 tbsp rice into oval shape.',
  '9. Add small dab of wasabi, lay fish slice on top. Press gently to shape.',
  '10. For maki rolls: place nori (seaweed) shiny side down on bamboo mat.',
  '11. Spread thin layer of rice on nori, leaving 1-inch border at top.',
  '12. Lay fish strips and vegetables (cucumber, avocado) in center line.',
  '13. Roll tightly using bamboo mat. Wet border to seal. Let rest 2 minutes.',
  '14. Cut roll with wet, sharp knife into 6-8 pieces.',
  '15. Serve with soy sauce, pickled ginger, and wasabi. Eat within 30 minutes for best texture.'
] WHERE title = 'Sushi';

-- Update Gnocchi with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Bake 2 lbs russet potatoes at 400°F for 1 hour until completely tender. (Baking keeps them dry)',
  '2. While hot, cut potatoes in half. Scoop flesh and pass through ricer or food mill immediately.',
  '3. Spread riced potatoes on baking sheet to release steam and cool slightly.',
  '4. Season with 1 tsp salt. Make well in center of potatoes.',
  '5. Add 1 beaten egg to well. Sprinkle 1.5 cups flour over potatoes.',
  '6. Gently knead just until dough comes together - work as little as possible to keep gnocchi tender.',
  '7. Divide dough into 6 portions. Roll each into 3/4-inch thick rope.',
  '8. Cut ropes into 1-inch pieces.',
  '9. To shape: roll each piece down fork tines while pressing with thumb to create ridges.',
  '10. Place shaped gnocchi on floured tray. Don''t let them touch.',
  '11. Bring large pot of salted water to gentle boil.',
  '12. Drop gnocchi in batches (don''t crowd). They''re done when they float - about 2-3 minutes.',
  '13. Remove with slotted spoon directly to your sauce.',
  '14. Toss immediately with brown butter and sage, tomato sauce, pesto, or gorgonzola cream.',
  '15. Serve immediately. Top with Parmesan.'
] WHERE title = 'Gnocchi';

-- Update Caesar Salad with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Make croutons: Cut day-old bread into 1-inch cubes. Toss with 3 tbsp olive oil, 1 minced garlic clove.',
  '2. Spread on baking sheet. Bake at 375°F for 10-15 minutes, tossing halfway, until golden and crispy.',
  '3. For authentic dressing: Mince 2 anchovy fillets to paste (essential for traditional flavor).',
  '4. In large wooden bowl, mash anchovies with 1 minced garlic clove using back of spoon.',
  '5. Whisk in 2 egg yolks (use pasteurized if concerned about raw eggs).',
  '6. Add 2 tbsp fresh lemon juice, 1 tsp Dijon mustard, 1 tsp Worcestershire sauce.',
  '7. While whisking constantly, drizzle in 1/2 cup extra virgin olive oil very slowly to emulsify.',
  '8. Stir in 1/2 cup finely grated Parmesan. Season with black pepper.',
  '9. Wash and thoroughly dry 2 heads romaine lettuce. Tear into bite-sized pieces.',
  '10. Add lettuce to bowl with dressing. Toss until every leaf is coated.',
  '11. Add croutons and toss gently.',
  '12. Serve immediately on chilled plates.',
  '13. Top with additional shaved Parmesan and freshly cracked black pepper.',
  '14. Optional: Add grilled chicken breast slices or grilled shrimp for protein.'
] WHERE title = 'Caesar Salad';

-- Update Spring Rolls with detailed instructions
UPDATE recipes SET instructions = ARRAY[
  '1. Soak 2 oz rice vermicelli in hot water until soft, about 5 minutes. Drain, cut into shorter lengths.',
  '2. Prepare fillings: julienne 1 cucumber, 1 carrot, 1 red bell pepper into thin matchsticks.',
  '3. Wash and dry 1 cup fresh mint leaves, 1 cup fresh cilantro, 1 cup Thai basil.',
  '4. Shred 2 cups butter lettuce or leaf lettuce.',
  '5. Cook 1/2 lb shrimp - boil 2-3 minutes until pink. Cool, slice in half lengthwise.',
  '6. Fill large bowl with warm water (not hot - it will make wrappers too soft).',
  '7. Dip one rice paper wrapper in water for 10-15 seconds until just pliable.',
  '8. Lay wrapper on clean damp towel. It will continue softening.',
  '9. Layer fillings on bottom third: lettuce first, then noodles, vegetables, herbs.',
  '10. Fold bottom of wrapper over filling. Fold in both sides tightly.',
  '11. Place 2-3 shrimp halves in a row, pink side down, on the wrapper above the filling.',
  '12. Roll tightly to top. The shrimp will show through the translucent wrapper.',
  '13. For peanut sauce: blend 1/4 cup peanut butter, 2 tbsp hoisin, 1 tbsp rice vinegar, sriracha to taste, warm water to thin.',
  '14. Serve immediately. Rolls can be covered with damp towel for up to 2 hours.'
] WHERE title = 'Spring Rolls';