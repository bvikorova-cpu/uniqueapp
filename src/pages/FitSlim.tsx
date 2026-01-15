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
      id: 9,
      title: "Tuna Stuffed Avocado Boats",
      calories: "295 kcal",
      protein: "28g",
      time: "12 min",
      image: tunaAvocado,
      ingredients: [
        "2 medium ripe avocados (approximately 300g total)",
        "160g canned albacore tuna in water, drained",
        "30g Greek yogurt (0% fat)",
        "15ml fresh lime juice",
        "30g red onion, finely minced",
        "2g sea salt",
        "1g freshly ground black pepper",
        "5g fresh cilantro, finely chopped"
      ],
      instructions: "Carefully slice each avocado in half lengthwise and remove the pit by tapping it with a knife blade and twisting. Scoop a small amount of additional flesh from each cavity to create a larger well for the filling. In a medium mixing bowl, combine the drained tuna with Greek yogurt and mash together with a fork until well incorporated. Add the finely minced red onion and fresh lime juice to the tuna mixture and stir thoroughly. Season with sea salt and freshly ground black pepper, adjusting to taste preference. Divide the tuna salad mixture evenly among the four avocado halves, mounding it generously in the center. Garnish each stuffed avocado with freshly chopped cilantro and an extra squeeze of lime juice for brightness."
    },
    {
      id: 10,
      title: "Spicy Chicken Chili with Black Beans",
      calories: "310 kcal",
      protein: "32g",
      time: "35 min",
      image: chickenChiliBeans,
      ingredients: [
        "250g boneless skinless chicken breast, diced into 2cm cubes",
        "200g canned black beans, drained and rinsed",
        "200g canned crushed tomatoes",
        "1 medium red bell pepper (approximately 150g), diced",
        "1 medium yellow onion (approximately 120g), finely chopped",
        "2 large garlic cloves (approximately 8g), minced",
        "15ml olive oil",
        "5g ground cumin",
        "3g smoked paprika",
        "2g cayenne pepper (adjust to taste)",
        "3g sea salt"
      ],
      instructions: "Heat the olive oil in a large Dutch oven or heavy-bottomed pot over medium-high heat until shimmering. Season the diced chicken with salt and half the spices, then sear in the hot oil for 3-4 minutes until golden brown on all sides. Remove the chicken and set aside, then add the onion and garlic to the same pot, sautéing for 3 minutes until softened and fragrant. Add the diced bell pepper and cook for an additional 2 minutes until slightly tender. Stir in the remaining cumin, paprika, and cayenne pepper, toasting the spices for 30 seconds until aromatic. Add the crushed tomatoes and black beans, stirring to combine all ingredients thoroughly. Return the seared chicken to the pot and bring the mixture to a gentle simmer. Cover and cook for 20-25 minutes until the chicken is cooked through and flavors have melded together beautifully."
    },
    {
      id: 11,
      title: "Thai Vegetable Curry with Chickpeas",
      calories: "275 kcal",
      protein: "14g",
      time: "28 min",
      image: vegetableCurryChickpeas,
      ingredients: [
        "200g canned chickpeas, drained and rinsed",
        "200ml light coconut milk",
        "30g Thai red curry paste",
        "1 medium red bell pepper (approximately 150g), sliced",
        "150g baby spinach leaves",
        "1 medium zucchini (approximately 180g), half-moon sliced",
        "15ml coconut oil",
        "10g fresh basil leaves",
        "15ml fresh lime juice",
        "10ml low-sodium soy sauce"
      ],
      instructions: "Heat the coconut oil in a large wok or deep skillet over medium-high heat until it begins to shimmer. Add the red curry paste and stir-fry for 60 seconds until fragrant and the oils begin to separate. Pour in the coconut milk and whisk thoroughly to incorporate the curry paste completely. Add the sliced bell pepper and zucchini to the curry, stirring to coat them evenly in the sauce. Simmer for 8-10 minutes until the vegetables are tender but still have a slight crunch. Fold in the chickpeas and continue cooking for 3-4 minutes until heated through. Add the baby spinach and stir gently until wilted, about 2 minutes. Finish with soy sauce, fresh lime juice, and torn basil leaves, serving immediately over steamed jasmine rice or cauliflower rice for a lower-carb option."
    },
    {
      id: 12,
      title: "Lemon Herb Baked Cod with Asparagus",
      calories: "245 kcal",
      protein: "36g",
      time: "22 min",
      image: bakedCodLemon,
      ingredients: [
        "200g fresh Atlantic cod fillet",
        "250g fresh asparagus spears, trimmed",
        "1 medium lemon (approximately 60g), zested and sliced",
        "30ml extra virgin olive oil",
        "3 large garlic cloves (approximately 12g), minced",
        "10g fresh parsley, finely chopped",
        "5g fresh thyme leaves",
        "3g sea salt",
        "2g freshly ground black pepper"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a large baking sheet with parchment paper for easy cleanup. Pat the cod fillet completely dry with paper towels to ensure proper browning and seasoning adhesion. Season both sides of the cod with salt, pepper, lemon zest, and half the minced garlic, then set aside. Trim the woody ends from the asparagus spears and toss them in a bowl with olive oil, remaining garlic, and a pinch of salt. Arrange the asparagus in a single layer on one half of the prepared baking sheet and place the seasoned cod on the other half. Top the cod with thin lemon slices and fresh thyme leaves for aromatic flavor infusion. Bake for 15-18 minutes until the cod flakes easily with a fork and reaches an internal temperature of 63°C, and the asparagus is tender-crisp with slightly charred tips."
    },
    {
      id: 13,
      title: "Teriyaki Tofu Brown Rice Power Bowl",
      calories: "320 kcal",
      protein: "18g",
      time: "30 min",
      image: tofuBrownRiceBowl,
      ingredients: [
        "200g extra-firm tofu, pressed and cubed",
        "150g cooked brown rice",
        "100g shelled edamame",
        "1 medium carrot (approximately 80g), julienned",
        "½ medium cucumber (approximately 100g), sliced",
        "30ml low-sodium teriyaki sauce",
        "15ml toasted sesame oil",
        "10g sesame seeds",
        "2 green onions (approximately 15g), thinly sliced"
      ],
      instructions: "Press the tofu block between paper towels with a heavy object for 15 minutes to remove excess moisture for better texture. Cut the pressed tofu into 2cm cubes and toss with half the teriyaki sauce in a bowl. Heat sesame oil in a large non-stick skillet over medium-high heat until shimmering. Add the marinated tofu cubes in a single layer and cook undisturbed for 3-4 minutes until golden brown on the bottom. Flip the tofu and continue cooking for another 3-4 minutes until crispy on all sides. Cook the brown rice according to package directions while preparing the vegetables, and steam the edamame for 3 minutes. Assemble the bowl by placing warm brown rice as a base, then arranging the crispy tofu, edamame, julienned carrot, and sliced cucumber in sections. Drizzle with remaining teriyaki sauce, sprinkle with sesame seeds and sliced green onions, and serve immediately."
    },
    {
      id: 14,
      title: "Creamy Broccoli Soup with Cashews",
      calories: "195 kcal",
      protein: "10g",
      time: "25 min",
      image: creamyBroccoliSoup,
      ingredients: [
        "400g fresh broccoli florets",
        "50g raw cashews, soaked for 30 minutes",
        "1 medium yellow onion (approximately 120g), diced",
        "2 large garlic cloves (approximately 8g), minced",
        "750ml low-sodium vegetable broth",
        "15ml extra virgin olive oil",
        "3g sea salt",
        "2g ground black pepper",
        "2g ground nutmeg"
      ],
      instructions: "Heat the olive oil in a large soup pot over medium heat until it shimmers gently. Add the diced onion and sauté for 4-5 minutes until softened and translucent, stirring occasionally. Add the minced garlic and cook for an additional minute until fragrant but not browned. Add the broccoli florets and vegetable broth to the pot, bringing to a rolling boil. Reduce heat to medium-low and simmer for 12-15 minutes until the broccoli is very tender and easily pierced with a fork. Drain the soaked cashews and add them to the soup pot for creaminess without dairy. Using an immersion blender or transferring to a countertop blender in batches, puree the soup until completely smooth and velvety. Season with salt, pepper, and nutmeg, adjusting to taste, and serve hot with a drizzle of olive oil on top."
    },
    {
      id: 15,
      title: "Herb-Roasted Chicken Breast with Mixed Greens",
      calories: "335 kcal",
      protein: "42g",
      time: "28 min",
      image: herbRoastedChicken,
      ingredients: [
        "250g boneless skinless chicken breast",
        "100g mixed baby greens (arugula, spinach, mesclun)",
        "50g cherry tomatoes, halved",
        "30g red onion, thinly sliced",
        "30ml extra virgin olive oil",
        "15ml balsamic vinegar",
        "5g fresh rosemary, finely chopped",
        "5g fresh thyme leaves",
        "3g sea salt",
        "2g freshly ground black pepper"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and let the chicken breast come to room temperature for 10 minutes for even cooking. Combine the fresh rosemary, thyme, 15ml olive oil, salt, and pepper in a small bowl to create an herb paste. Coat the chicken breast thoroughly with the herb mixture on all sides, pressing the herbs into the surface. Heat an oven-safe skillet over medium-high heat and sear the chicken for 2-3 minutes per side until golden brown. Transfer the skillet to the preheated oven and roast for 12-15 minutes until the internal temperature reaches 74°C. While the chicken rests for 5 minutes, toss the mixed greens with cherry tomatoes, red onion, remaining olive oil, and balsamic vinegar. Slice the rested chicken against the grain and arrange over the dressed salad, drizzling any accumulated juices on top."
    },
    {
      id: 16,
      title: "Mediterranean Lentils with Tomatoes and Zucchini",
      calories: "265 kcal",
      protein: "16g",
      time: "32 min",
      image: lentilsTomatoesZucchini,
      ingredients: [
        "150g dried green or brown lentils, rinsed",
        "2 medium zucchini (approximately 350g), diced",
        "200g cherry tomatoes, halved",
        "1 medium yellow onion (approximately 120g), diced",
        "3 large garlic cloves (approximately 12g), minced",
        "30ml extra virgin olive oil",
        "5g ground cumin",
        "3g smoked paprika",
        "500ml vegetable broth",
        "10g fresh parsley, chopped"
      ],
      instructions: "Rinse the lentils thoroughly under cold running water and set aside in a fine-mesh strainer. Heat olive oil in a large deep skillet or Dutch oven over medium heat until shimmering. Add the diced onion and sauté for 4-5 minutes until softened and beginning to turn golden at the edges. Stir in the minced garlic, cumin, and smoked paprika, cooking for 1 minute until very fragrant. Add the rinsed lentils and vegetable broth, bringing to a boil before reducing heat to a simmer. Cook for 15-18 minutes until the lentils are almost tender but still hold their shape. Add the diced zucchini and halved cherry tomatoes, continuing to simmer for 8-10 minutes until vegetables are tender and lentils are fully cooked. Season with salt and pepper to taste, garnish generously with fresh chopped parsley, and serve warm as a complete protein-rich meal."
    },
    {
      id: 17,
      title: "Asian Cabbage Salad with Turkey",
      calories: "255 kcal",
      protein: "28g",
      time: "18 min",
      image: cabbageSaladTurkey,
      ingredients: [
        "200g lean ground turkey (93% lean)",
        "200g napa cabbage, finely shredded",
        "100g red cabbage, finely shredded",
        "1 medium carrot (approximately 80g), julienned",
        "30ml low-sodium soy sauce",
        "15ml rice vinegar",
        "15ml toasted sesame oil",
        "10g fresh ginger, grated",
        "2 large garlic cloves (approximately 8g), minced",
        "10g sesame seeds"
      ],
      instructions: "Heat half the sesame oil in a large skillet over medium-high heat until it begins to shimmer. Add the ground turkey, breaking it into small crumbles with a wooden spoon as it cooks. Cook for 6-8 minutes until the turkey is fully browned and cooked through with no pink remaining. Add the grated ginger and minced garlic to the turkey, stirring for 1 minute until aromatic. Remove from heat and set aside to cool slightly while preparing the salad base. In a large mixing bowl, combine the shredded napa cabbage, red cabbage, and julienned carrot. In a small bowl, whisk together the soy sauce, rice vinegar, and remaining sesame oil to create the dressing. Add the warm turkey to the cabbage mixture and toss with the dressing until everything is evenly coated. Sprinkle generously with sesame seeds and serve immediately while the turkey is still warm."
    },
    {
      id: 18,
      title: "Asian Vegetable Skewers with Rice Noodles",
      calories: "285 kcal",
      protein: "13g",
      time: "24 min",
      image: vegetableSkewersNoodles,
      ingredients: [
        "150g dried rice noodles (thin vermicelli style)",
        "1 large red bell pepper (approximately 180g), cut into 3cm chunks",
        "1 medium zucchini (approximately 200g), cut into 2cm rounds",
        "150g cremini mushrooms, halved",
        "150g cherry tomatoes, whole",
        "30ml low-sodium soy sauce",
        "15ml toasted sesame oil",
        "3 large garlic cloves (approximately 12g), minced",
        "10g fresh ginger, grated",
        "10g fresh cilantro, chopped"
      ],
      instructions: "Soak wooden skewers in water for 20 minutes to prevent burning during cooking. Cook the rice noodles according to package directions, usually 4-5 minutes in boiling water, then drain and rinse with cold water to stop cooking. Thread the bell pepper chunks, zucchini rounds, mushroom halves, and cherry tomatoes alternately onto the soaked skewers. Preheat your grill or oven broiler to high heat and brush the vegetable skewers with half the sesame oil. Grill or broil the skewers for 12-15 minutes, turning every 4 minutes, until vegetables are charred and tender. In a small saucepan, heat the remaining sesame oil with minced garlic and grated ginger for 1 minute until fragrant. Add the soy sauce and warm through, then toss the cooked noodles in this sauce until evenly coated. Serve the noodles in bowls topped with the grilled vegetable skewers and garnish with fresh cilantro."
    },
  ];

  const healthyRecipes = [
    {
      id: 1,
      title: "Creamy Steel-Cut Oatmeal with Fresh Berries",
      calories: "350 kcal",
      benefit: "Sustained energy for the whole day",
      time: "15 min",
      image: oatmealFruit,
      ingredients: [
        "80g steel-cut or rolled oats",
        "250ml whole milk or oat milk",
        "1 medium ripe banana (approximately 120g), sliced",
        "50g fresh blueberries",
        "30g fresh raspberries",
        "15ml pure honey or maple syrup",
        "2g ground Ceylon cinnamon",
        "30g raw walnuts, roughly chopped",
        "15g sliced almonds for topping"
      ],
      instructions: "Pour the milk into a medium saucepan and bring to a gentle simmer over medium heat, being careful not to let it boil over. Add the oats and reduce heat to low, stirring occasionally for 10-12 minutes until the oats are creamy and tender. Stir in the honey and ground cinnamon during the last 2 minutes of cooking, allowing the flavors to meld together. Transfer the cooked oatmeal to a serving bowl and let it cool for 2 minutes so toppings don't sink. Arrange the sliced banana in an overlapping pattern on one side of the bowl. Scatter the fresh blueberries and raspberries across the surface for vibrant color and antioxidant benefits. Top with roughly chopped walnuts and sliced almonds for added crunch and healthy fats, then serve immediately while warm."
    },
    {
      id: 2,
      title: "Omega-3 Baked Salmon with Garlic Broccoli",
      calories: "420 kcal",
      benefit: "Heart-healthy omega-3 fatty acids",
      time: "28 min",
      image: bakedSalmonBroccoli,
      ingredients: [
        "250g fresh Atlantic salmon fillet, skin-on",
        "400g fresh broccoli florets",
        "45ml extra virgin olive oil, divided",
        "3 large garlic cloves (approximately 12g), minced",
        "1 medium lemon (approximately 60g), zested and juiced",
        "3g sea salt",
        "2g freshly ground black pepper",
        "10g toasted sesame seeds",
        "5g fresh dill, chopped"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a large rimmed baking sheet with parchment paper. Pat the salmon fillet completely dry with paper towels and season generously with salt, pepper, and lemon zest on both sides. Cut the broccoli into uniform florets approximately 4cm in size for even roasting. In a large mixing bowl, toss the broccoli florets with 30ml olive oil and half the minced garlic until evenly coated. Arrange the broccoli in a single layer on one half of the prepared baking sheet, cut sides facing down for maximum caramelization. Place the seasoned salmon skin-side down on the other half and drizzle with remaining olive oil and lemon juice. Roast for 20-22 minutes until the salmon flakes easily and reaches an internal temperature of 62°C, and broccoli is tender with charred edges. Garnish with toasted sesame seeds and fresh dill before serving."
    },
    {
      id: 3,
      title: "California Avocado Toast with Poached Eggs",
      calories: "380 kcal",
      benefit: "Healthy monounsaturated fats and protein",
      time: "15 min",
      image: avocadoToastEgg,
      ingredients: [
        "2 thick slices artisan whole grain bread (approximately 80g)",
        "1 large ripe Hass avocado (approximately 150g)",
        "2 large organic eggs",
        "15ml fresh lemon juice",
        "100g cherry tomatoes, halved",
        "15ml white vinegar (for poaching)",
        "3g flaky Maldon sea salt",
        "2g freshly cracked black pepper",
        "5g microgreens or fresh basil"
      ],
      instructions: "Fill a medium saucepan with 8cm of water, add white vinegar, and bring to a gentle simmer with small bubbles forming on the bottom. While the water heats, halve the avocado, remove the pit, and scoop the flesh into a bowl. Mash the avocado with a fork to your desired consistency, whether chunky or smooth, and stir in lemon juice, salt, and pepper. Toast the bread slices until golden brown and crispy on the edges. Create a gentle whirlpool in the simmering water and carefully crack each egg into the center, poaching for exactly 3 minutes for a runny yolk. Spread the seasoned avocado generously on each toast slice, creating an even layer edge to edge. Using a slotted spoon, carefully lift each poached egg and place it atop the avocado. Garnish with halved cherry tomatoes, microgreens, and an extra pinch of flaky salt."
    },
    {
      id: 4,
      title: "Probiotic Greek Yogurt Parfait with Honey",
      calories: "310 kcal",
      benefit: "Gut-healthy probiotics and calcium",
      time: "8 min",
      image: greekYogurtNutsHoney,
      ingredients: [
        "200g full-fat Greek yogurt (5% or higher)",
        "40g raw walnuts, roughly chopped",
        "20g raw almonds, sliced",
        "20ml raw organic honey",
        "15g chia seeds",
        "80g mixed fresh berries (strawberries, blueberries, raspberries)",
        "2g ground cinnamon",
        "10g toasted coconut flakes"
      ],
      instructions: "Spoon the thick Greek yogurt into a wide serving bowl or glass jar for an attractive layered presentation. Roughly chop the walnuts into irregular pieces that will provide varied texture in each bite. In a separate small bowl, combine the chopped walnuts, sliced almonds, and chia seeds for easy sprinkling. Create an even layer of the nut and seed mixture over the yogurt surface. Drizzle the raw honey in a zigzag pattern across the top, allowing it to pool slightly in places. Arrange the fresh berries artfully on top, varying colors for visual appeal. Finish with a generous sprinkle of ground cinnamon and toasted coconut flakes. Serve immediately for maximum crunch, or refrigerate for up to 2 hours for a softer chia seed texture."
    },
    {
      id: 5,
      title: "Immunity-Boosting Chicken Noodle Soup",
      calories: "280 kcal",
      benefit: "Immune system support and hydration",
      time: "50 min",
      image: chickenNoodleSoup,
      ingredients: [
        "300g bone-in chicken thighs or drumsticks",
        "2 medium carrots (approximately 160g), diced",
        "2 celery stalks (approximately 120g), sliced",
        "1 medium yellow onion (approximately 130g), diced",
        "2000ml filtered water",
        "100g egg noodles or pasta",
        "15g fresh flat-leaf parsley, chopped",
        "3g sea salt",
        "2g freshly ground black pepper",
        "2 bay leaves",
        "5g fresh thyme sprigs"
      ],
      instructions: "Place the chicken pieces in a large stockpot and cover with 2000ml of cold filtered water for the clearest broth. Add the bay leaves and thyme sprigs, then bring to a gentle boil over medium-high heat. Reduce heat to low and simmer for 20 minutes, periodically skimming any foam that rises to the surface. Add the diced onion, carrots, and celery to the pot, continuing to simmer for another 15 minutes until vegetables are tender. Remove the chicken pieces with tongs and set aside until cool enough to handle, about 5 minutes. Shred the chicken meat, discarding skin and bones, and return the meat to the pot. Add the egg noodles and cook for 8-10 minutes according to package directions until al dente. Remove bay leaves and thyme stems, season with salt and pepper, and garnish generously with fresh chopped parsley."
    },
    {
      id: 6,
      title: "Antioxidant Açaí Smoothie Bowl with Chia",
      calories: "330 kcal",
      benefit: "Powerful antioxidants and fiber",
      time: "10 min",
      image: smoothieBowlChia,
      ingredients: [
        "1 medium frozen banana (approximately 120g)",
        "100g frozen açaí puree packet",
        "100g frozen mixed berries",
        "150ml unsweetened almond milk",
        "20g chia seeds",
        "40g granola (low-sugar variety)",
        "50g fresh seasonal fruit for topping",
        "15g unsweetened coconut flakes",
        "15g natural almond butter"
      ],
      instructions: "Remove the frozen açaí packet from the freezer and run it under warm water for 30 seconds to soften slightly for easier blending. Break the frozen banana into chunks and add to a high-powered blender along with the açaí and frozen berries. Pour in just enough almond milk to help the blending process, keeping the mixture as thick as possible for a spoonable consistency. Blend on high for 60-90 seconds, using the tamper tool to push ingredients down, until completely smooth and thick like soft-serve. Pour the smoothie base into a chilled bowl, spreading it evenly to create a flat surface for toppings. Sprinkle chia seeds in a line across one section, followed by granola, fresh fruit, and coconut flakes in separate sections. Drizzle almond butter in thin ribbons across the entire bowl and serve immediately before it melts."
    },
    {
      id: 7,
      title: "Fiber-Rich Baked Sweet Potatoes with Black Bean Salsa",
      calories: "390 kcal",
      benefit: "Fiber, vitamins, and sustained energy",
      time: "45 min",
      image: sweetPotatoBlackBeans,
      ingredients: [
        "2 medium sweet potatoes (approximately 400g total)",
        "200g canned black beans, drained and rinsed",
        "1 medium red bell pepper (approximately 150g), finely diced",
        "1 ripe Hass avocado (approximately 150g), cubed",
        "2 green onions (approximately 20g), thinly sliced",
        "30ml fresh lime juice",
        "15ml extra virgin olive oil",
        "3g sea salt",
        "2g ground cumin",
        "5g fresh cilantro, chopped"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a baking sheet with aluminum foil for easy cleanup. Scrub the sweet potatoes thoroughly under running water and pierce each one 6-8 times with a fork to allow steam to escape. Place the sweet potatoes directly on the prepared baking sheet and bake for 40-45 minutes until completely tender when pierced with a knife. While the potatoes bake, prepare the black bean salsa by combining drained black beans with diced bell pepper in a mixing bowl. Add fresh lime juice, cumin, salt, and half the olive oil, stirring gently to combine without mashing the beans. Once the sweet potatoes are done, slice them open lengthwise and gently mash the flesh inside with a fork. Top each potato generously with the black bean salsa, cubed avocado, and sliced green onions. Drizzle with remaining olive oil and garnish with fresh cilantro."
    },
    {
      id: 8,
      title: "Protein-Packed Tuna and Avocado Salad",
      calories: "360 kcal",
      benefit: "Complete protein with omega-3 fatty acids",
      time: "12 min",
      image: tunaSaladAvocado,
      ingredients: [
        "150g canned albacore tuna in olive oil, drained",
        "1 large ripe Hass avocado (approximately 170g), cubed",
        "60g mixed baby salad greens",
        "100g cherry tomatoes, halved",
        "1 medium Persian cucumber (approximately 100g), sliced",
        "30ml extra virgin olive oil",
        "20ml fresh lemon juice",
        "3g flaky sea salt",
        "2g freshly cracked black pepper",
        "5g fresh dill, chopped"
      ],
      instructions: "Drain the tuna thoroughly and transfer to a medium mixing bowl, flaking it gently with a fork into bite-sized chunks. Carefully cube the ripe avocado and add to the tuna, being gentle to maintain the avocado's shape. Halve the cherry tomatoes and slice the cucumber into thin rounds, adding both to the bowl. In a small jar with a lid, combine the olive oil, lemon juice, salt, and pepper, shaking vigorously to emulsify the dressing. Arrange the mixed baby greens as a bed on a large serving plate or individual salad bowls. Gently toss the tuna mixture with half the dressing, being careful not to mash the avocado. Mound the dressed tuna salad over the greens and drizzle remaining dressing on top, finishing with fresh chopped dill."
    },
    {
      id: 9,
      title: "Whole Grain Buttermilk Pancakes with Mixed Berries",
      calories: "340 kcal",
      benefit: "Complex carbohydrates and sustained energy",
      time: "20 min",
      image: wholeGrainPancakes,
      ingredients: [
        "120g whole wheat flour",
        "1 large organic egg (approximately 55g)",
        "180ml buttermilk (or milk with 1 tbsp lemon juice)",
        "5g baking powder",
        "2g baking soda",
        "120g fresh mixed berries (strawberries, blueberries)",
        "30ml pure maple syrup",
        "15g coconut oil for cooking",
        "2g vanilla extract",
        "Pinch of sea salt"
      ],
      instructions: "In a large mixing bowl, whisk together the whole wheat flour, baking powder, baking soda, and salt until well combined. In a separate bowl, beat the egg and then add the buttermilk and vanilla extract, whisking until smooth. Create a well in the center of the dry ingredients and pour in the wet mixture, stirring gently until just combined with some small lumps remaining. Let the batter rest for 5 minutes while heating a non-stick skillet or griddle over medium heat. Add a small amount of coconut oil to the hot pan and swirl to coat evenly. Pour approximately 60ml of batter per pancake and cook until bubbles form on the surface and edges appear set, about 2-3 minutes. Flip carefully and cook for another 1-2 minutes until golden brown on both sides. Stack pancakes on a warm plate, top with fresh berries, and drizzle generously with pure maple syrup."
    },
    {
      id: 10,
      title: "Hawaiian Ahi Tuna Poke Bowl",
      calories: "410 kcal",
      benefit: "Premium omega-3 and essential minerals",
      time: "25 min",
      image: tunaPokeBowl,
      ingredients: [
        "200g sushi-grade ahi tuna, diced into 2cm cubes",
        "150g cooked sushi rice",
        "1 ripe Hass avocado (approximately 150g), sliced",
        "80g shelled edamame, steamed",
        "1 medium Persian cucumber (approximately 100g), thinly sliced",
        "30g wakame seaweed, rehydrated",
        "30ml low-sodium soy sauce",
        "10ml toasted sesame oil",
        "10g black sesame seeds",
        "2 green onions, sliced"
      ],
      instructions: "Cook the sushi rice according to package directions and allow it to cool to room temperature for the best poke bowl texture. Rehydrate the wakame seaweed in cold water for 5-10 minutes, then drain thoroughly and squeeze out excess moisture. In a medium bowl, gently toss the diced ahi tuna with soy sauce and sesame oil, being careful not to break up the cubes. Let the tuna marinate for 5-10 minutes while preparing the remaining ingredients. Steam the edamame for 3-4 minutes until tender and vibrant green. Slice the avocado and cucumber into thin, uniform pieces for attractive presentation. Place the cooled sushi rice in the bottom of a serving bowl and arrange the marinated tuna in the center. Arrange the avocado slices, edamame, cucumber, and wakame in sections around the tuna, then sprinkle with black sesame seeds and sliced green onions."
    },
    {
      id: 11,
      title: "French Spinach and Gruyère Quiche",
      calories: "365 kcal",
      benefit: "Iron, calcium, and complete protein",
      time: "55 min",
      image: spinachQuiche,
      ingredients: [
        "1 sheet frozen puff pastry (approximately 250g), thawed",
        "200g fresh baby spinach leaves",
        "4 large eggs (approximately 220g total)",
        "150ml heavy cream",
        "100g Gruyère cheese, grated",
        "1 medium yellow onion (approximately 120g), finely diced",
        "15ml olive oil",
        "3g sea salt",
        "2g freshly ground black pepper",
        "1g freshly grated nutmeg"
      ],
      instructions: "Preheat your oven to 180°C (350°F) and lightly grease a 23cm tart pan with a removable bottom. Roll out the thawed puff pastry and carefully press it into the prepared pan, trimming any excess from the edges. Prick the bottom with a fork, line with parchment and pie weights, and blind bake for 12 minutes until lightly golden. Heat olive oil in a large skillet over medium heat and sauté the diced onion for 4-5 minutes until softened and translucent. Add the fresh spinach in batches, stirring until completely wilted, about 3 minutes, then transfer to a colander to drain excess liquid. In a large bowl, whisk together the eggs, cream, salt, pepper, and nutmeg until smooth and well combined. Spread the cooled spinach mixture evenly over the pre-baked crust, then sprinkle with grated Gruyère cheese. Pour the egg mixture carefully over the spinach and cheese, ensuring even distribution. Bake for 35-40 minutes until the filling is set and the top is golden brown with slight puffing."
    },
    {
      id: 12,
      title: "Detoxifying Green Goddess Smoothie",
      calories: "220 kcal",
      benefit: "Natural detoxification and alkalizing",
      time: "8 min",
      image: greenDetoxSmoothie,
      ingredients: [
        "60g fresh baby spinach leaves",
        "½ medium English cucumber (approximately 150g), roughly chopped",
        "1 medium Granny Smith apple (approximately 180g), cored and quartered",
        "1 medium ripe banana (approximately 120g)",
        "Juice of ½ lemon (approximately 20ml)",
        "200ml pure coconut water",
        "10g fresh ginger, peeled and sliced",
        "5 fresh mint leaves"
      ],
      instructions: "Rinse all fresh produce thoroughly under cold running water to remove any residual dirt or pesticides. Core the apple and cut into quarters, leaving the nutrient-rich skin intact for added fiber. Roughly chop the cucumber into 2cm pieces for easier blending in standard blenders. Peel the ginger root and slice it into thin coins to ensure it blends smoothly without leaving fibrous chunks. Add the coconut water to the blender first, followed by the spinach and mint leaves which will blend more easily with liquid present. Add the cucumber, apple, banana, ginger, and lemon juice to the blender. Blend on high speed for 90-120 seconds until the smoothie is completely smooth with no visible chunks remaining. Pour immediately into a tall glass and consume within 15 minutes for maximum nutrient retention and the freshest taste."
    },
    {
      id: 13,
      title: "Nourishing Buddha Bowl with Tahini Dressing",
      calories: "385 kcal",
      benefit: "Complete balanced nutrition in one bowl",
      time: "35 min",
      image: buddhaBowlHummus,
      ingredients: [
        "100g tri-color quinoa, rinsed",
        "80g store-bought hummus",
        "150g butternut squash, cubed and roasted",
        "100g baby kale or spinach",
        "80g cherry tomatoes, halved",
        "60g roasted chickpeas",
        "30ml tahini",
        "20ml fresh lemon juice",
        "15ml olive oil",
        "10ml warm water"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a baking sheet with parchment paper for the roasted vegetables. Cook the quinoa according to package directions, typically 15 minutes in boiling water with a 2:1 ratio, then fluff with a fork. Toss the cubed butternut squash with olive oil, salt, and pepper, then roast for 25-30 minutes until caramelized and tender. While vegetables roast, prepare the tahini dressing by whisking together tahini, lemon juice, and warm water until smooth and pourable. Arrange the cooked quinoa as a base in a large serving bowl, spreading it to cover the bottom evenly. Section the bowl by adding roasted butternut squash, baby greens, halved cherry tomatoes, and roasted chickpeas in separate areas. Place a generous dollop of hummus in the center of the bowl as the protein-rich focal point. Drizzle the tahini dressing over the entire bowl and serve immediately while the quinoa and squash are still warm."
    },
    {
      id: 14,
      title: "Tropical Chia Seed Pudding with Fresh Mango",
      calories: "295 kcal",
      benefit: "Fiber, omega-3, and slow-release energy",
      time: "10 min + 4 hours chilling",
      image: chiaPuddingMango,
      ingredients: [
        "45g chia seeds",
        "240ml full-fat coconut milk",
        "20ml pure maple syrup",
        "2g vanilla extract",
        "1 large ripe mango (approximately 250g), peeled and diced",
        "20g unsweetened toasted coconut flakes",
        "Fresh mint leaves for garnish",
        "10g passion fruit pulp (optional)"
      ],
      instructions: "In a medium mixing bowl or mason jar, combine the chia seeds with coconut milk and whisk vigorously to prevent clumping. Add the maple syrup and vanilla extract, stirring thoroughly to distribute the sweetener evenly. Cover the mixture and refrigerate for a minimum of 4 hours, ideally overnight, stirring once after the first 30 minutes. The chia seeds will absorb the liquid and create a thick, pudding-like consistency that holds its shape. Peel the ripe mango and cut the flesh into 1cm cubes, collecting any juice that runs off. When ready to serve, give the chia pudding a final stir to ensure even consistency throughout. Divide the pudding between two serving glasses or bowls, layering with diced mango as you go. Top with toasted coconut flakes, fresh mint leaves, and passion fruit pulp if using."
    },
    {
      id: 15,
      title: "Autumn Roasted Butternut Squash with Quinoa and Goat Cheese",
      calories: "345 kcal",
      benefit: "Beta-carotene and plant protein",
      time: "40 min",
      image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&auto=format&fit=crop",
      ingredients: [
        "350g butternut squash, peeled and cubed",
        "120g white quinoa, rinsed",
        "60g soft goat cheese, crumbled",
        "40g raw walnuts, roughly chopped",
        "30ml extra virgin olive oil",
        "15ml raw honey",
        "5g fresh thyme leaves",
        "3g sea salt",
        "2g freshly ground black pepper"
      ],
      instructions: "Preheat your oven to 200°C (400°F) and line a large baking sheet with parchment paper. Peel the butternut squash, remove seeds, and cut into uniform 2cm cubes for even roasting. Toss the squash cubes with 20ml olive oil, thyme leaves, salt, and pepper until evenly coated. Spread the squash in a single layer on the prepared baking sheet and roast for 25-30 minutes until fork-tender and caramelized on the edges. While the squash roasts, cook the quinoa in boiling salted water according to package directions, about 15 minutes. Drain any excess water and fluff the quinoa with a fork to separate the grains. Transfer the cooked quinoa to a large serving bowl and gently fold in the roasted butternut squash while still warm. Crumble the soft goat cheese over the top, scatter with chopped walnuts, and drizzle with remaining olive oil and honey."
    },
    {
      id: 16,
      title: "Anti-Inflammatory Thai Green Curry with Vegetables",
      calories: "370 kcal",
      benefit: "Anti-inflammatory compounds and immune support",
      time: "30 min",
      image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop",
      ingredients: [
        "45g Thai green curry paste",
        "400ml full-fat coconut milk",
        "200g extra-firm tofu or chicken breast, cubed",
        "1 medium red bell pepper (approximately 150g), sliced",
        "120g canned bamboo shoots, drained",
        "80g sugar snap peas",
        "20g fresh Thai basil leaves",
        "30ml fresh lime juice",
        "15ml fish sauce or soy sauce",
        "15ml coconut oil"
      ],
      instructions: "Heat the coconut oil in a large wok or deep skillet over medium-high heat until it shimmers and begins to smoke slightly. Add the green curry paste and stir-fry for 60-90 seconds until very fragrant and the oils begin to separate from the paste. Pour in half the coconut milk and stir vigorously to incorporate the curry paste completely. Add the cubed tofu or chicken and cook for 5-6 minutes, stirring occasionally, until lightly browned on all sides. Add the sliced bell pepper, bamboo shoots, and remaining coconut milk, bringing to a gentle simmer. Cook for 8-10 minutes until the vegetables are tender but still have a slight crunch and the protein is cooked through. Stir in the sugar snap peas during the last 3 minutes of cooking to preserve their bright green color. Finish with fish sauce and fresh lime juice, then garnish generously with torn Thai basil leaves before serving over steamed jasmine rice."
    },
    {
      id: 17,
      title: "Muscle-Building Protein Pancakes with Banana",
      calories: "325 kcal",
      benefit: "High protein for muscle recovery and growth",
      time: "18 min",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop",
      ingredients: [
        "2 large organic eggs (approximately 110g)",
        "1 large ripe banana (approximately 130g)",
        "35g vanilla whey protein powder",
        "50g rolled oats",
        "3g ground cinnamon",
        "15g coconut oil for cooking",
        "30ml pure maple syrup",
        "Fresh berries for serving"
      ],
      instructions: "Peel the ripe banana and add it to a blender or food processor, blending until completely smooth with no chunks remaining. Add the eggs to the banana puree and blend for another 30 seconds until fully incorporated. Add the protein powder, rolled oats, and cinnamon to the blender and pulse until the batter is smooth and homogeneous. Let the batter rest for 3-5 minutes while the oats absorb some liquid, which will result in fluffier pancakes. Heat a non-stick skillet over medium heat and add a small amount of coconut oil, swirling to coat evenly. Pour approximately 60ml of batter per pancake and cook until bubbles form on the surface and edges look set, about 2-3 minutes. Flip carefully with a thin spatula and cook for another 1-2 minutes until golden brown on both sides. Stack the pancakes on a warm plate, drizzle with maple syrup, and serve with fresh berries for added antioxidants."
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
