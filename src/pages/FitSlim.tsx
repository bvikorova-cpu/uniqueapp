import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Clock, ChefHat, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import video thumbnails - weight loss
import hiitWorkout from "@/assets/videos/hiit-workout.jpg";
import cardioBeginners from "@/assets/videos/cardio-beginners.jpg";
import fullBodyBurn from "@/assets/videos/full-body-burn.jpg";
import tabataTraining from "@/assets/videos/tabata-training.jpg";
import bellyWorkout from "@/assets/videos/belly-workout.jpg";
import bodyweightTraining from "@/assets/videos/bodyweight-training.jpg";
import jumpingJacks from "@/assets/videos/jumping-jacks.jpg";
import cardioDance from "@/assets/videos/cardio-dance.jpg";
import thighsGlutes from "@/assets/videos/thighs-glutes.jpg";
import morningBoost from "@/assets/videos/morning-boost.jpg";
import plankChallenge from "@/assets/videos/plank-challenge.jpg";

// Import video thumbnails - health
import morningYoga from "@/assets/videos/morning-yoga.jpg";
import backStretching from "@/assets/videos/back-stretching.jpg";
import meditation from "@/assets/videos/meditation.jpg";
import pilates from "@/assets/videos/pilates.jpg";
import kneeRehab from "@/assets/videos/knee-rehab.jpg";
import shoulderMobility from "@/assets/videos/shoulder-mobility.jpg";
import taiChi from "@/assets/videos/tai-chi.jpg";
import foamRolling from "@/assets/videos/foam-rolling.jpg";
import postureExercises from "@/assets/videos/posture-exercises.jpg";
import eveningStretch from "@/assets/videos/evening-stretch.jpg";
import hipExercises from "@/assets/videos/hip-exercises.jpg";
import yinYoga from "@/assets/videos/yin-yoga.jpg";
import mindfulness from "@/assets/videos/mindfulness.jpg";
import carpalTunnel from "@/assets/videos/carpal-tunnel.jpg";
import officeYoga from "@/assets/videos/office-yoga.jpg";

// Import recipe images
import grilledChickenSalad from "@/assets/recipes/grilled-chicken-salad.jpg";
import quinoaRoastedVegetables from "@/assets/recipes/quinoa-roasted-vegetables.jpg";
import proteinSmoothie from "@/assets/recipes/protein-smoothie.jpg";
import lentilSoup from "@/assets/recipes/lentil-soup.jpg";
import grilledSalmonBrussels from "@/assets/recipes/grilled-salmon-brussels.jpg";
import vegetableWrapHummus from "@/assets/recipes/vegetable-wrap-hummus.jpg";
import cottageCheeseVegetables from "@/assets/recipes/cottage-cheese-vegetables.jpg";
import spinachOmelette from "@/assets/recipes/spinach-omelette.jpg";
import tunaAvocado from "@/assets/recipes/tuna-avocado.jpg";
import chickenChiliBeans from "@/assets/recipes/chicken-chili-beans.jpg";
import vegetableCurryChickpeas from "@/assets/recipes/vegetable-curry-chickpeas.jpg";
import bakedCodLemon from "@/assets/recipes/baked-cod-lemon.jpg";
import tofuBrownRiceBowl from "@/assets/recipes/tofu-brown-rice-bowl.jpg";
import creamyBroccoliSoup from "@/assets/recipes/creamy-broccoli-soup.jpg";
import herbRoastedChicken from "@/assets/recipes/herb-roasted-chicken.jpg";
import lentilsTomatoesZucchini from "@/assets/recipes/lentils-tomatoes-zucchini.jpg";
import cabbageSaladTurkey from "@/assets/recipes/cabbage-salad-turkey.jpg";
import vegetableSkewersNoodles from "@/assets/recipes/vegetable-skewers-noodles.jpg";
import oatmealFruit from "@/assets/recipes/oatmeal-fruit.jpg";
import bakedSalmonBroccoli from "@/assets/recipes/baked-salmon-broccoli.jpg";
import avocadoToastEgg from "@/assets/recipes/avocado-toast-egg.jpg";
import greekYogurtNutsHoney from "@/assets/recipes/greek-yogurt-nuts-honey.jpg";
import chickenNoodleSoup from "@/assets/recipes/chicken-noodle-soup.jpg";
import smoothieBowlChia from "@/assets/recipes/smoothie-bowl-chia.jpg";
import sweetPotatoBlackBeans from "@/assets/recipes/sweet-potato-black-beans.jpg";
import tunaSaladAvocado from "@/assets/recipes/tuna-salad-avocado.jpg";
import wholeGrainPancakes from "@/assets/recipes/whole-grain-pancakes.jpg";
import tunaPokeBowl from "@/assets/recipes/tuna-poke-bowl.jpg";
import spinachQuiche from "@/assets/recipes/spinach-quiche.jpg";
import greenDetoxSmoothie from "@/assets/recipes/green-detox-smoothie.jpg";
import buddhaBowlHummus from "@/assets/recipes/buddha-bowl-hummus.jpg";
import chiaPuddingMango from "@/assets/recipes/chia-pudding-mango.jpg";

const FitSlim = () => {
  const [activeTab, setActiveTab] = useState("weight-loss-videos");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const weightLossVideos = [
    {
      id: 1,
      title: "10-Minute HIIT Workout for Weight Loss",
      duration: "10 min",
      difficulty: "Medium",
      calories: "150 kcal",
      thumbnail: hiitWorkout,
      videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Cardio for Beginners",
      duration: "15 min",
      difficulty: "Easy",
      calories: "120 kcal",
      thumbnail: cardioBeginners,
      videoUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Full Body - Fat Burning",
      duration: "20 min",
      difficulty: "Hard",
      calories: "250 kcal",
      thumbnail: fullBodyBurn,
      videoUrl: "https://www.youtube.com/embed/UItWltVZZmE?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Tabata Training - Intense Calorie Burn",
      duration: "25 min",
      difficulty: "Hard",
      calories: "300 kcal",
      thumbnail: tabataTraining,
      videoUrl: "https://www.youtube.com/embed/20LH4dEeWg0?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Belly Fat Loss Workout",
      duration: "12 min",
      difficulty: "Medium",
      calories: "100 kcal",
      thumbnail: bellyWorkout,
      videoUrl: "https://www.youtube.com/embed/1919eTCoESo?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Bodyweight Training for Weight Loss",
      duration: "18 min",
      difficulty: "Medium",
      calories: "200 kcal",
      thumbnail: bodyweightTraining,
      videoUrl: "https://www.youtube.com/embed/cbKkB3POqaY?autoplay=1&rel=0",
    },
    {
      id: 7,
      title: "Jumping Jacks - Interval Training",
      duration: "14 min",
      difficulty: "Medium",
      calories: "180 kcal",
      thumbnail: jumpingJacks,
      videoUrl: "https://www.youtube.com/embed/2W4ZNSwoW_4?autoplay=1&rel=0",
    },
    {
      id: 8,
      title: "Cardio Dance - Fun Weight Loss",
      duration: "30 min",
      difficulty: "Medium",
      calories: "320 kcal",
      thumbnail: cardioDance,
      videoUrl: "https://www.youtube.com/embed/gCBsupdwdVw?autoplay=1&rel=0",
    },
    {
      id: 9,
      title: "Thighs and Glutes Training",
      duration: "16 min",
      difficulty: "Hard",
      calories: "220 kcal",
      thumbnail: thighsGlutes,
      videoUrl: "https://www.youtube.com/embed/SZ6IshIbWGc?autoplay=1&rel=0",
    },
    {
      id: 10,
      title: "Morning Metabolism Boost",
      duration: "8 min",
      difficulty: "Easy",
      calories: "90 kcal",
      thumbnail: morningBoost,
      videoUrl: "https://www.youtube.com/embed/3sEeVJEXTfY?autoplay=1&rel=0",
    },
    {
      id: 11,
      title: "Plank Challenge - Core Strengthening",
      duration: "10 min",
      difficulty: "Medium",
      calories: "110 kcal",
      thumbnail: plankChallenge,
      videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw?autoplay=1&rel=0",
    },
  ];

  const healthVideos = [
    {
      id: 1,
      title: "Morning Yoga for Energy",
      duration: "15 min",
      difficulty: "Easy",
      benefit: "Energy and Flexibility",
      thumbnail: morningYoga,
      videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Stretching for Healthy Back",
      duration: "10 min",
      difficulty: "Easy",
      benefit: "Pain Relief",
      thumbnail: backStretching,
      videoUrl: "https://www.youtube.com/embed/qULTwquOuT4?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Meditation and Breathing Exercises",
      duration: "12 min",
      difficulty: "Easy",
      benefit: "Stress Reduction",
      thumbnail: meditation,
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Pilates for Strong Core",
      duration: "20 min",
      difficulty: "Medium",
      benefit: "Core Strengthening",
      thumbnail: pilates,
      videoUrl: "https://www.youtube.com/embed/K56Z12XH6WY?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Knee Rehabilitation Exercises",
      duration: "14 min",
      difficulty: "Easy",
      benefit: "Joint Strengthening",
      thumbnail: kneeRehab,
      videoUrl: "https://www.youtube.com/embed/AXcJRHYfz5U?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Shoulder and Neck Mobility",
      duration: "8 min",
      difficulty: "Easy",
      benefit: "Tension Relief",
      thumbnail: shoulderMobility,
      videoUrl: "https://www.youtube.com/embed/3j_jHMy5JBQ?autoplay=1&rel=0",
    },
    {
      id: 7,
      title: "Tai Chi for Beginners",
      duration: "18 min",
      difficulty: "Easy",
      benefit: "Balance and Peace",
      thumbnail: taiChi,
      videoUrl: "https://www.youtube.com/embed/6w7IS8_UzHM?autoplay=1&rel=0",
    },
    {
      id: 8,
      title: "Foam Rolling - Muscle Recovery",
      duration: "12 min",
      difficulty: "Easy",
      benefit: "Muscle Release",
      thumbnail: foamRolling,
      videoUrl: "https://www.youtube.com/embed/IlMGY5yKS4o?autoplay=1&rel=0",
    },
    {
      id: 9,
      title: "Posture Improvement Exercises",
      duration: "16 min",
      difficulty: "Medium",
      benefit: "Proper Posture",
      thumbnail: postureExercises,
      videoUrl: "https://www.youtube.com/embed/RqcOCBb4arc?autoplay=1&rel=0",
    },
    {
      id: 10,
      title: "Evening Relaxation Stretch",
      duration: "10 min",
      difficulty: "Easy",
      benefit: "Better Sleep",
      thumbnail: eveningStretch,
      videoUrl: "https://www.youtube.com/embed/ErZ_5-jC-Sg?autoplay=1&rel=0",
    },
    {
      id: 11,
      title: "Healthy Hip Exercises",
      duration: "14 min",
      difficulty: "Easy",
      benefit: "Hip Mobility",
      thumbnail: hipExercises,
      videoUrl: "https://www.youtube.com/embed/YwO4GFrqXKc?autoplay=1&rel=0",
    },
    {
      id: 12,
      title: "Yin Yoga - Deep Stretching",
      duration: "25 min",
      difficulty: "Easy",
      benefit: "Flexibility",
      thumbnail: yinYoga,
      videoUrl: "https://www.youtube.com/embed/LcnFzJZID18?autoplay=1&rel=0",
    },
    {
      id: 13,
      title: "Mindfulness Meditation",
      duration: "15 min",
      difficulty: "Easy",
      benefit: "Mental Health",
      thumbnail: mindfulness,
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU?autoplay=1&rel=0",
    },
    {
      id: 14,
      title: "Carpal Tunnel Syndrome Exercises",
      duration: "8 min",
      difficulty: "Easy",
      benefit: "Healthy Wrists",
      thumbnail: carpalTunnel,
      videoUrl: "https://www.youtube.com/embed/fdD7CgN5FGg?autoplay=1&rel=0",
    },
    {
      id: 15,
      title: "Office Yoga",
      duration: "10 min",
      difficulty: "Easy",
      benefit: "Relief from Sitting",
      thumbnail: officeYoga,
      videoUrl: "https://www.youtube.com/embed/M-8FvC3GD8c?autoplay=1&rel=0",
    },
  ];

  const weightLossRecipes = [
    {
      id: 1,
      title: "Grilled Chicken Salad with Citrus Vinaigrette",
      calories: "320 kcal",
      protein: "35g",
      time: "20 min",
      image: grilledChickenSalad,
      ingredients: [
        "200g boneless chicken breast fillet",
        "100g mixed baby greens (arugula, spinach, lettuce)",
        "1 large ripe tomato (approximately 150g)",
        "½ medium cucumber (approximately 120g)",
        "50g cherry tomatoes, halved",
        "30ml extra virgin olive oil",
        "15ml fresh lemon juice",
        "2g sea salt",
        "1g freshly ground black pepper",
        "5g fresh mixed herbs (basil, parsley, dill)"
      ],
      instructions: "Begin by seasoning the 200g chicken breast evenly with sea salt and freshly ground black pepper on both sides. Heat a grill pan or skillet over medium-high heat and cook the chicken for 5-7 minutes per side until the internal temperature reaches 75°C and juices run clear. While the chicken rests, thoroughly wash all vegetables under cold running water. Dice the large tomato into bite-sized cubes, slice the cucumber into thin half-moons, and halve the cherry tomatoes. In a large mixing bowl, combine the baby greens with all chopped vegetables. In a small bowl, whisk together the olive oil and lemon juice to create a simple vinaigrette. Slice the grilled chicken against the grain into thin strips. Toss the salad with the dressing, top with sliced chicken, and finish with freshly chopped herbs for a burst of fresh flavor."
    },
    {
      id: 2,
      title: "Roasted Rainbow Vegetable Quinoa Bowl",
      calories: "280 kcal",
      protein: "12g",
      time: "30 min",
      image: quinoaRoastedVegetables,
      ingredients: [
        "150g dried quinoa (white or tri-color)",
        "1 medium red bell pepper (approximately 180g)",
        "1 medium zucchini (approximately 200g)",
        "1 small eggplant (approximately 250g)",
        "200g cherry tomatoes on the vine",
        "2 large garlic cloves, minced (approximately 8g)",
        "45ml extra virgin olive oil",
        "3g sea salt",
        "2g ground black pepper",
        "5g fresh thyme leaves"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a large baking sheet with parchment paper. Rinse the quinoa thoroughly under cold water using a fine-mesh strainer to remove any bitterness, then cook according to package directions (typically 15 minutes in boiling water with a 2:1 water-to-quinoa ratio). While the quinoa cooks, dice the bell pepper, zucchini, and eggplant into uniform 2cm cubes for even roasting. In a large mixing bowl, toss the chopped vegetables with olive oil, minced garlic, salt, and pepper until evenly coated. Spread the vegetables in a single layer on the prepared baking sheet and roast for 20-25 minutes, tossing halfway through, until they develop golden-brown caramelized edges. Once the quinoa is cooked and the vegetables are roasted, fluff the quinoa with a fork and gently fold in the roasted vegetables. Finish with fresh thyme leaves and serve warm as a complete plant-based meal."
    },
    {
      id: 3,
      title: "Vanilla Berry Protein Power Smoothie",
      calories: "250 kcal",
      protein: "25g",
      time: "5 min",
      image: proteinSmoothie,
      ingredients: [
        "1 medium ripe banana (approximately 120g)",
        "150g frozen strawberries",
        "30g vanilla protein powder (whey or plant-based)",
        "200ml unsweetened almond milk",
        "15g chia seeds",
        "5ml honey or maple syrup",
        "50g ice cubes"
      ],
      instructions: "Peel the ripe banana and break it into 3-4 chunks for easier blending. Add the banana pieces, frozen strawberries, and protein powder to a high-powered blender. Pour in the almond milk, which serves as the liquid base for a smooth consistency. Add the chia seeds for an omega-3 boost and fiber content, along with honey for natural sweetness. Blend on high speed for 60-90 seconds until the mixture is completely smooth and creamy with no visible lumps. If you prefer a thicker, frostier texture, add ice cubes and blend for an additional 20-30 seconds. Pour immediately into a tall glass and enjoy this protein-packed post-workout recovery drink or energizing breakfast replacement."
    },
    {
      id: 4,
      title: "Hearty Red Lentil Vegetable Soup",
      calories: "210 kcal",
      protein: "15g",
      time: "35 min",
      image: lentilSoup,
      ingredients: [
        "150g dried red lentils, rinsed",
        "2 medium carrots (approximately 150g), diced",
        "1 large celery stalk (approximately 80g), chopped",
        "1 medium yellow onion (approximately 120g), finely diced",
        "2 large garlic cloves (approximately 8g), minced",
        "30g tomato paste",
        "15ml olive oil",
        "1000ml low-sodium vegetable broth",
        "3g sea salt",
        "2g ground black pepper",
        "2g ground cumin"
      ],
      instructions: "Heat the olive oil in a large soup pot over medium heat until shimmering. Add the finely diced onion and minced garlic, sautéing for 3-4 minutes until the onion becomes translucent and fragrant. Stir in the chopped carrots and celery, continuing to cook for an additional 5 minutes to develop deeper flavors. Add the tomato paste and stir continuously for 1 minute to caramelize it slightly, which enhances the soup's umami depth. Pour in the rinsed red lentils followed by the vegetable broth, stirring to combine all ingredients. Bring the soup to a rolling boil, then reduce heat to low and simmer uncovered for 25-30 minutes until the lentils are completely tender and breaking apart. Season with salt, pepper, and cumin, adjusting to taste. For a creamier texture, use an immersion blender to partially puree the soup, or leave it chunky for more texture."
    },
    {
      id: 5,
      title: "Herb-Crusted Salmon with Roasted Brussels Sprouts",
      calories: "340 kcal",
      protein: "38g",
      time: "25 min",
      image: grilledSalmonBrussels,
      ingredients: [
        "200g fresh salmon fillet, skin removed",
        "300g fresh Brussels sprouts, trimmed and halved",
        "30ml extra virgin olive oil",
        "1 medium lemon (approximately 60g), zested and juiced",
        "2 large garlic cloves (approximately 8g), pressed",
        "3g sea salt",
        "2g freshly ground black pepper",
        "10g fresh dill, finely chopped"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a large baking sheet with parchment paper for easy cleanup. Pat the salmon fillet completely dry with paper towels to ensure proper seasoning adhesion. Season both sides of the salmon generously with salt, pepper, and fresh lemon zest, then drizzle with 10ml of olive oil and set aside. In a large mixing bowl, toss the halved Brussels sprouts with the remaining 20ml olive oil, pressed garlic, and a pinch of salt and pepper until evenly coated. Arrange the Brussels sprouts cut-side down on one side of the prepared baking sheet and place the seasoned salmon on the other side. Roast everything together for 18-20 minutes, until the salmon flakes easily with a fork and the Brussels sprouts are caramelized with crispy, golden-brown edges. Remove from the oven, squeeze fresh lemon juice over both the salmon and vegetables, and garnish generously with chopped fresh dill before serving."
    },
    {
      id: 6,
      title: "Mediterranean Vegetable Wrap with Creamy Hummus",
      calories: "290 kcal",
      protein: "14g",
      time: "15 min",
      image: vegetableWrapHummus,
      ingredients: [
        "2 large whole wheat tortillas (approximately 80g each)",
        "100g store-bought or homemade hummus",
        "1 medium red bell pepper (approximately 150g), julienned",
        "½ medium cucumber (approximately 100g), thinly sliced",
        "50g fresh baby spinach leaves",
        "50g red cabbage, finely shredded",
        "1 medium carrot (approximately 80g), julienned or shaved",
        "15ml fresh lemon juice",
        "2g flaky sea salt"
      ],
      instructions: "Wash and thoroughly dry all fresh vegetables to prevent the wrap from becoming soggy. Using a sharp knife, julienne the red bell pepper and carrot into thin matchstick strips for easier wrapping and better texture. Thinly slice the cucumber into rounds and finely shred the red cabbage for optimal distribution. Lay the two whole wheat tortillas flat on a clean work surface and spread 50g of hummus evenly across the center of each tortilla, leaving a 2cm border around the edges. Layer the baby spinach leaves first to create a moisture barrier, then arrange the julienned pepper, cucumber slices, shredded cabbage, and carrot strips in neat rows. Drizzle fresh lemon juice over the vegetables and sprinkle with flaky sea salt for brightness. Fold in the sides of the tortilla, then roll tightly from the bottom up, tucking as you go to create a compact wrap. Slice each wrap diagonally in half and serve immediately, or wrap tightly in foil for a portable lunch."
    },
    {
      id: 7,
      title: "Cottage Cheese Bowl with Fresh Vegetables",
      calories: "180 kcal",
      protein: "20g",
      time: "10 min",
      image: cottageCheeseVegetables,
      ingredients: [
        "200g low-fat cottage cheese (2% milkfat)",
        "1 medium cucumber (approximately 150g), diced",
        "2 medium ripe tomatoes (approximately 200g), diced",
        "2 spring onions (approximately 20g), thinly sliced",
        "10g fresh basil leaves, torn",
        "10ml extra virgin olive oil",
        "2g sea salt",
        "1g freshly ground black pepper"
      ],
      instructions: "Thoroughly wash and dice the cucumber and tomatoes into uniform small cubes for the best texture and flavor distribution. Thinly slice the spring onions, including the tender green parts, which add a mild onion flavor without overpowering the dish. Transfer the cottage cheese to a large mixing bowl and fold in the diced cucumber, tomatoes, and sliced spring onions, mixing gently to combine while maintaining the cottage cheese's texture. Tear fresh basil leaves by hand rather than chopping them with a knife, as this prevents bruising and preserves their aromatic oils. Season the mixture with sea salt and freshly ground black pepper, adjusting to your taste preference. Drizzle the olive oil over the top and give everything one final gentle stir to incorporate. Serve immediately in a chilled bowl for the freshest taste and crispest vegetable texture."
    },
    {
      id: 8,
      title: "Mediterranean Spinach and Feta Omelette",
      calories: "240 kcal",
      protein: "22g",
      time: "12 min",
      image: spinachOmelette,
      ingredients: [
        "3 large eggs (approximately 180g total)",
        "100g fresh baby spinach leaves",
        "30g crumbled feta cheese",
        "1 large garlic clove (approximately 4g), pressed",
        "15ml extra virgin olive oil",
        "2g sea salt",
        "1g freshly ground black pepper"
      ],
      instructions: "Crack the eggs into a medium mixing bowl and whisk vigorously with a fork for about 30 seconds until the yolks and whites are completely combined and slightly frothy. Season the beaten eggs with a pinch of salt and freshly ground black pepper. Rinse the fresh spinach leaves thoroughly under cold water and roughly chop them into bite-sized pieces. Heat the olive oil in a medium non-stick skillet over medium heat until it shimmers but doesn't smoke. Add the pressed garlic and sauté for 30 seconds until fragrant, then add the chopped spinach and cook for 2 minutes, stirring occasionally, until wilted. Pour the beaten eggs evenly over the spinach, tilting the pan to distribute them across the entire surface. Allow the eggs to cook undisturbed for 2-3 minutes until the edges begin to set, then sprinkle the crumbled feta cheese over half of the omelette. Using a spatula, carefully fold the omelette in half and continue cooking for another 2-3 minutes until the eggs are fully set but still tender."
    },
    {
      id: 18,
      title: "Vegetable Skewers with Rice Noodles",
      calories: "285 kcal",
      protein: "13g",
      time: "24 min",
      image: vegetableSkewersNoodles,
      ingredients: [
        "150g rice noodles",
        "1 bell pepper",
        "1 zucchini",
        "mushrooms",
        "cherry tomatoes",
        "soy sauce",
        "sesame oil",
        "garlic, ginger"
      ],
      instructions: "1. Cook rice noodles according to instructions.\n2. Cut vegetables and thread onto skewers.\n3. Grill or bake in the oven for 15 minutes.\n4. Heat sesame oil in a pan.\n5. Add garlic, ginger and soy sauce.\n6. Mix with noodles and serve with skewers."
    },
  ];

  const healthyRecipes = [
    {
      id: 1,
      title: "Oatmeal with Fresh Fruit",
      calories: "350 kcal",
      benefit: "Energy for the whole day",
      time: "10 min",
      image: oatmealFruit,
      ingredients: [
        "80g oat flakes",
        "250ml milk or plant-based milk",
        "1 banana",
        "50g blueberries",
        "1 tablespoon honey",
        "cinnamon",
        "nuts for topping"
      ],
      instructions: "1. Pour milk over oat flakes and cook for 5 minutes.\n2. Add honey and cinnamon.\n3. Let it cool slightly.\n4. Slice the banana into rounds.\n5. Transfer porridge to a bowl and decorate with banana, blueberries and nuts.\n6. Serve warm."
    },
    {
      id: 2,
      title: "Baked Salmon with Broccoli",
      calories: "420 kcal",
      benefit: "Omega-3 fatty acids",
      time: "25 min",
      image: bakedSalmonBroccoli,
      ingredients: [
        "250g salmon",
        "400g broccoli",
        "3 tablespoons olive oil",
        "2 cloves of garlic",
        "lemon",
        "salt, pepper",
        "sesame seeds"
      ],
      instructions: "1. Preheat oven to 200°C.\n2. Divide broccoli into florets and toss with half the oil and garlic.\n3. Season salmon, drizzle with lemon and olive oil.\n4. Place salmon and broccoli on a baking sheet.\n5. Bake for 20-22 minutes.\n6. Sprinkle with sesame seeds and serve."
    },
    {
      id: 3,
      title: "Avocado Toast with Egg",
      calories: "380 kcal",
      benefit: "Healthy fats",
      time: "15 min",
      image: avocadoToastEgg,
      ingredients: [
        "2 slices whole grain bread",
        "1 avocado",
        "2 eggs",
        "lemon juice",
        "cherry tomatoes",
        "salt, pepper",
        "fresh basil"
      ],
      instructions: "1. Toast bread in a toaster.\n2. Mash avocado with a fork and mix with lemon juice.\n3. Fry eggs or cook soft-boiled.\n4. Spread toast with avocado.\n5. Add egg and cherry tomatoes.\n6. Sprinkle with salt, pepper and basil."
    },
    {
      id: 4,
      title: "Greek Yogurt with Nuts and Honey",
      calories: "310 kcal",
      benefit: "Probiotics",
      time: "5 min",
      image: greekYogurtNutsHoney,
      ingredients: [
        "200g Greek yogurt",
        "30g walnuts",
        "1 tablespoon honey",
        "1 tablespoon chia seeds",
        "fresh berries",
        "cinnamon"
      ],
      instructions: "1. Transfer Greek yogurt to a bowl.\n2. Roughly chop the nuts.\n3. Sprinkle yogurt with nuts and chia seeds.\n4. Drizzle with honey.\n5. Add fresh fruit.\n6. Sprinkle with cinnamon and serve."
    },
    {
      id: 5,
      title: "Chicken Noodle Soup",
      calories: "280 kcal",
      benefit: "Immunity boost",
      time: "45 min",
      image: chickenNoodleSoup,
      ingredients: [
        "300g chicken pieces",
        "2 carrots",
        "1 celery",
        "1 onion",
        "2l water",
        "100g homemade noodles",
        "parsley",
        "salt, pepper, bay leaf"
      ],
      instructions: "1. Pour water over chicken and add bay leaf.\n2. Cook for 20 minutes and skim off the foam.\n3. Add chopped vegetables and cook for another 15 minutes.\n4. Remove meat and vegetables, strain the broth.\n5. Add noodles to the broth and cook for 5 minutes.\n6. Return the meat, season and sprinkle with parsley."
    },
    {
      id: 6,
      title: "Smoothie Bowl with Chia Seeds",
      calories: "330 kcal",
      benefit: "Antioxidants",
      time: "8 min",
      image: smoothieBowlChia,
      ingredients: [
        "1 frozen banana",
        "100g frozen berries",
        "150ml almond milk",
        "1 tablespoon chia seeds",
        "granola",
        "fresh fruit",
        "coconut flakes"
      ],
      instructions: "1. Blend frozen banana, berries and milk until smooth.\n2. Pour smoothie into a bowl.\n3. Sprinkle with chia seeds.\n4. Add granola, fresh fruit and coconut flakes.\n5. Serve immediately.\n6. You can also add honey or peanut butter."
    },
    {
      id: 7,
      title: "Baked Sweet Potatoes with Black Beans",
      calories: "390 kcal",
      benefit: "Fiber and vitamins",
      time: "40 min",
      image: sweetPotatoBlackBeans,
      ingredients: [
        "2 sweet potatoes",
        "200g black beans (canned)",
        "1 bell pepper",
        "1 avocado",
        "spring onion",
        "lime juice",
        "olive oil",
        "salt, pepper, cumin"
      ],
      instructions: "1. Preheat oven to 200°C.\n2. Prick sweet potatoes with a fork and bake for 35-40 minutes.\n3. Chop bell pepper and fry with black beans.\n4. Cut open baked potatoes and fill with bean and pepper mixture.\n5. Add avocado and spring onion.\n6. Drizzle with lime juice and sprinkle with cumin."
    },
    {
      id: 8,
      title: "Tuna Salad with Avocado",
      calories: "360 kcal",
      benefit: "Omega-3 and protein",
      time: "12 min",
      image: tunaSaladAvocado,
      ingredients: [
        "150g canned tuna",
        "1 avocado",
        "50g baby salad greens",
        "cherry tomatoes",
        "cucumber",
        "olive oil",
        "lemon juice",
        "salt, pepper"
      ],
      instructions: "1. Drain and flake the tuna.\n2. Dice the avocado.\n3. Halve cherry tomatoes, slice cucumber.\n4. Mix all ingredients in a bowl.\n5. Prepare dressing from oil and lemon.\n6. Mix and serve on salad leaves."
    },
    {
      id: 9,
      title: "Whole Grain Pancakes with Berries",
      calories: "340 kcal",
      benefit: "Complex carbohydrates",
      time: "18 min",
      image: wholeGrainPancakes,
      ingredients: [
        "100g whole grain flour",
        "1 egg",
        "150ml milk",
        "1 teaspoon baking powder",
        "100g fresh berries",
        "maple syrup",
        "coconut oil for frying"
      ],
      instructions: "1. Mix flour, egg, milk and baking powder.\n2. Let the batter rest for 5 minutes.\n3. Heat coconut oil in a pan.\n4. Ladle the batter and cook pancakes on both sides.\n5. Serve with fresh berries.\n6. Drizzle with maple syrup."
    },
    {
      id: 10,
      title: "Tuna Poke Bowl",
      calories: "410 kcal",
      benefit: "Omega-3 and minerals",
      time: "20 min",
      image: tunaPokeBowl,
      ingredients: [
        "200g fresh tuna",
        "150g sushi rice",
        "avocado",
        "edamame",
        "cucumber",
        "wakame seaweed",
        "soy sauce",
        "sesame seeds"
      ],
      instructions: "1. Cook sushi rice according to instructions.\n2. Dice tuna and marinate in soy sauce.\n3. Slice avocado and cucumber.\n4. Cook edamame.\n5. Put rice in a bowl and gradually add all ingredients.\n6. Sprinkle with sesame and drizzle with remaining sauce."
    },
    {
      id: 11,
      title: "Spinach Quiche",
      calories: "365 kcal",
      benefit: "Iron and calcium",
      time: "50 min",
      image: spinachQuiche,
      ingredients: [
        "1 puff pastry",
        "200g fresh spinach",
        "3 eggs",
        "150ml cream",
        "100g feta cheese",
        "onion",
        "salt, pepper, nutmeg"
      ],
      instructions: "1. Preheat oven to 180°C.\n2. Spread puff pastry into a pie dish.\n3. Fry spinach and onion, let cool.\n4. Mix eggs, cream, salt and pepper.\n5. Add spinach and crumbled feta.\n6. Pour onto pastry and bake for 35-40 minutes."
    },
    {
      id: 12,
      title: "Green Detox Smoothie",
      calories: "220 kcal",
      benefit: "Detoxification",
      time: "5 min",
      image: greenDetoxSmoothie,
      ingredients: [
        "1 handful baby spinach",
        "1/2 cucumber",
        "1 green apple",
        "1 banana",
        "juice of 1/2 lemon",
        "200ml coconut water",
        "ginger"
      ],
      instructions: "1. Rinse all ingredients.\n2. Chop apple and cucumber.\n3. Put spinach, cucumber, apple and banana into the blender.\n4. Add lemon juice, ginger and coconut water.\n5. Blend for 1-2 minutes until smooth.\n6. Serve immediately."
    },
    {
      id: 13,
      title: "Buddha Bowl with Hummus",
      calories: "385 kcal",
      benefit: "Complete nutrient profile",
      time: "30 min",
      image: buddhaBowlHummus,
      ingredients: [
        "100g quinoa",
        "100g hummus",
        "roasted pumpkin",
        "roasted potatoes",
        "baby spinach",
        "cherry tomatoes",
        "tahini",
        "lemon"
      ],
      instructions: "1. Cook quinoa according to instructions.\n2. Cut pumpkin and potatoes and bake for 25 minutes at 200°C.\n3. Put quinoa as a base in a bowl.\n4. Gradually add roasted vegetables, spinach and tomatoes.\n5. Add hummus.\n6. Drizzle with tahini and lemon juice."
    },
    {
      id: 14,
      title: "Chia Pudding with Mango",
      calories: "295 kcal",
      benefit: "Fiber and omega-3",
      time: "10 min + chilling",
      image: chiaPuddingMango,
      ingredients: [
        "3 tablespoons chia seeds",
        "200ml coconut milk",
        "1 tablespoon maple syrup",
        "1 mango",
        "coconut flakes",
        "mint"
      ],
      instructions: "1. Mix chia seeds with coconut milk and syrup.\n2. Leave in the fridge for at least 4 hours (ideally overnight).\n3. Peel and dice the mango.\n4. Transfer pudding to glasses.\n5. Add mango and coconut flakes.\n6. Garnish with mint."
    },
    {
      id: 15,
      title: "Roasted Pumpkin with Quinoa",
      calories: "345 kcal",
      benefit: "Vitamin A and protein",
      time: "35 min",
      image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&auto=format&fit=crop",
      ingredients: [
        "300g pumpkin",
        "100g quinoa",
        "50g goat cheese",
        "30g walnuts",
        "olive oil",
        "honey",
        "thyme",
        "salt, pepper"
      ],
      instructions: "1. Preheat oven to 200°C.\n2. Dice pumpkin and toss with oil and thyme.\n3. Bake for 25 minutes.\n4. Cook quinoa according to instructions.\n5. Mix quinoa with roasted pumpkin.\n6. Add crumbled goat cheese, nuts and a drop of honey."
    },
    {
      id: 16,
      title: "Green Curry with Coconut Milk",
      calories: "370 kcal",
      benefit: "Anti-inflammatory effects",
      time: "28 min",
      image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop",
      ingredients: [
        "2 tablespoons green curry paste",
        "400ml coconut milk",
        "200g tofu or chicken",
        "1 bell pepper",
        "100g bamboo shoots",
        "peas",
        "basil",
        "lime juice"
      ],
      instructions: "1. Fry curry paste in a pan for 1 minute.\n2. Add coconut milk and stir.\n3. Add chopped tofu/chicken and vegetables.\n4. Cook for 15-20 minutes on low heat.\n5. Add fresh basil and lime juice.\n6. Serve with rice or noodles."
    },
    {
      id: 17,
      title: "Protein Pancakes with Banana",
      calories: "325 kcal",
      benefit: "Protein for muscle growth",
      time: "15 min",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop",
      ingredients: [
        "2 eggs",
        "1 banana",
        "30g protein powder",
        "50g oat flakes",
        "cinnamon",
        "coconut oil",
        "maple syrup"
      ],
      instructions: "1. Blend banana with eggs.\n2. Add protein powder, oat flakes and cinnamon.\n3. Mix into a smooth batter.\n4. Heat coconut oil in a pan.\n5. Cook pancakes on both sides until golden.\n6. Serve with maple syrup and fresh fruit."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-green-950/30 px-6 pb-10 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Futuristic Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 relative">
              <Heart className="h-10 w-10 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Fit & Slim Academy
              </h1>
              <p className="text-muted-foreground text-lg">Your complete fitness and wellness companion</p>
            </div>
          </div>
          
          {/* Premium Stats Card */}
          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30 backdrop-blur-sm mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{weightLossVideos.length}</div>
                  <div className="text-sm text-muted-foreground">Weight Loss Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">{healthVideos.length}</div>
                  <div className="text-sm text-muted-foreground">Health Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-400">{weightLossRecipes.length}+</div>
                  <div className="text-sm text-muted-foreground">Slimming Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{healthyRecipes.length}+</div>
                  <div className="text-sm text-muted-foreground">Healthy Recipes</div>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-4 max-w-3xl mx-auto">
                Transform your body and mind with our curated collection of workout videos, expert-designed recipes, 
                and comprehensive wellness programs. All content is 100% FREE!
              </p>
              <div className="flex justify-center mt-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-1">
                  🆓 Completely FREE
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger value="weight-loss-videos" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Play className="h-4 w-4 mr-2" />
              Weight Loss
            </TabsTrigger>
            <TabsTrigger value="health-videos" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Heart className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="weight-loss-recipes" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <ChefHat className="h-4 w-4 mr-2" />
              Slimming Recipes
            </TabsTrigger>
            <TabsTrigger value="healthy-recipes" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <ChefHat className="h-4 w-4 mr-2" />
              Healthy Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight-loss-videos" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Weight Loss Workouts</h2>
                <p className="text-muted-foreground">High-intensity training for maximum calorie burn</p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔥 Fat Burning</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-green-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-green-500/10"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-green-500/90 text-white border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                    <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0">
                      🔥 {video.calories}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-green-400 transition-colors line-clamp-2">
                      {video.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`
                        ${video.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
                        ${video.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : ''}
                        ${video.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/30' : ''}
                      `}>
                        {video.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Click to play</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health-videos" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Health & Wellness</h2>
                <p className="text-muted-foreground">Yoga, stretching, and mindfulness for better health</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">💚 Wellness</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-emerald-500/10"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-white border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                    <Badge className="absolute top-3 left-3 bg-teal-500/90 text-white border-0">
                      💚 {video.benefit}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {video.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        {video.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Click to play</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weight-loss-recipes" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Slimming Recipes</h2>
                <p className="text-muted-foreground">Low-calorie, high-protein meals for weight loss</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">🥗 Low Calorie</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-orange-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-orange-500/10"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-orange-500/90 text-white border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                    <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0">
                      🔥 {recipe.calories}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-orange-400 transition-colors line-clamp-2">
                      {recipe.title}
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                        💪 {recipe.protein} protein
                      </Badge>
                      <span className="text-muted-foreground">View recipe</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="healthy-recipes" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Healthy Living Recipes</h2>
                <p className="text-muted-foreground">Nutritious meals for a balanced lifestyle</p>
              </div>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">🌿 Nutritious</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-teal-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-teal-500/10"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-teal-500/90 text-white border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                    <Badge className="absolute top-3 left-3 bg-emerald-500/90 text-white border-0">
                      🔥 {recipe.calories}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-teal-400 transition-colors line-clamp-2">
                      {recipe.title}
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        💚 {recipe.benefit}
                      </Badge>
                      <span className="text-muted-foreground">View recipe</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-5xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Video Player</DialogTitle>
              <DialogDescription>
                Watch the workout video
              </DialogDescription>
            </DialogHeader>
            <div className="w-full px-6 pb-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {selectedVideo && (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={selectedVideo}
                    title="Video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recipe Detail Dialog */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedRecipe.time}
                    </span>
                    <span className="text-primary font-semibold">{selectedRecipe.calories}</span>
                    {selectedRecipe.protein && <span>Protein: {selectedRecipe.protein}</span>}
                    {selectedRecipe.benefit && (
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {selectedRecipe.benefit}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {selectedRecipe.ingredients && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <ChefHat className="h-5 w-5 mr-2" />
                        Ingredients
                      </h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRecipe.instructions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Preparation Instructions</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                          {selectedRecipe.instructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FitSlim;
