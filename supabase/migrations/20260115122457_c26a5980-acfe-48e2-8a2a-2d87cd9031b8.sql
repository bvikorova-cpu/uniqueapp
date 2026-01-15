-- Fix the Aglio e Olio recipe - translate from Slovak to English
UPDATE recipes 
SET 
  description = 'Classic Italian garlic and olive oil pasta with a spicy kick',
  ingredients = ARRAY[
    '500g fresh spaghetti or 400g dried',
    '6-8 cloves of garlic',
    '120ml extra virgin olive oil',
    '1-2 fresh chili peppers (to taste)',
    '1 bunch fresh parsley',
    'salt for cooking',
    '50g grated Parmesan (optional)',
    'black pepper'
  ],
  instructions = ARRAY[
    'Bring a large pot of salted water to boil.',
    'Peel and slice garlic into thin slices.',
    'Finely chop chili peppers (remove seeds for less heat).',
    'Finely chop parsley.',
    'Heat olive oil in a large pan over medium heat.',
    'Add garlic and fry for 2-3 minutes until golden (be careful not to burn it).',
    'Add chili and fry for another minute.',
    'Meanwhile, cook spaghetti al dente according to package directions (8-10 minutes).',
    'Reserve 150ml of pasta cooking water.',
    'Add drained spaghetti directly to the pan with garlic.',
    'Toss together, add pasta water and parsley.',
    'Season with salt and pepper.',
    'Serve with Parmesan (optional).'
  ]
WHERE title = 'Aglio e Olio';