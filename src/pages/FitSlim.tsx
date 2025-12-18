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
      title: "Vegetable Salad with Grilled Chicken",
      calories: "320 kcal",
      protein: "35g",
      time: "20 min",
      image: grilledChickenSalad,
      ingredients: [
        "200g chicken breast",
        "100g mixed green salads",
        "1 tomato",
        "1/2 cucumber",
        "50g cherry tomatoes",
        "2 tablespoons olive oil",
        "1 tablespoon lemon juice",
        "salt, black pepper",
        "fresh herbs to taste"
      ],
      instructions: "1. Season the chicken breast with salt and pepper.\n2. Grill on a pan or grill for 5-7 minutes on each side.\n3. Wash and chop the vegetables.\n4. In a bowl, mix the salads, chopped tomato, cucumber and cherry tomatoes.\n5. Prepare dressing from olive oil and lemon juice.\n6. Slice the grilled chicken.\n7. Add the chicken to the vegetables, pour the dressing and sprinkle with herbs."
    },
    {
      id: 2,
      title: "Quinoa with Roasted Vegetables",
      calories: "280 kcal",
      protein: "12g",
      time: "30 min",
      image: quinoaRoastedVegetables,
      ingredients: [
        "150g quinoa",
        "1 red bell pepper",
        "1 zucchini",
        "1 eggplant",
        "200g cherry tomatoes",
        "2 cloves of garlic",
        "3 tablespoons olive oil",
        "salt, pepper",
        "fresh thyme"
      ],
      instructions: "1. Rinse quinoa and cook according to package instructions (usually 15 minutes).\n2. Cut vegetables into cubes.\n3. Preheat oven to 200°C.\n4. Toss vegetables with olive oil, pressed garlic and pepper.\n5. Spread on a baking sheet and bake for 20-25 minutes.\n6. Add roasted vegetables to cooked quinoa.\n7. Season with fresh thyme and serve warm."
    },
    {
      id: 3,
      title: "Protein Smoothie with Fruit",
      calories: "250 kcal",
      protein: "25g",
      time: "5 min",
      image: proteinSmoothie,
      ingredients: [
        "1 banana",
        "150g frozen strawberries",
        "30g protein powder (vanilla)",
        "200ml almond milk",
        "1 tablespoon chia seeds",
        "1 teaspoon honey",
        "ice to taste"
      ],
      instructions: "1. Peel and break the banana into pieces.\n2. Put banana, strawberries, protein powder and almond milk into the blender.\n3. Add chia seeds and honey.\n4. Blend on high speed for 1-2 minutes until smooth.\n5. If you want a colder drink, add ice and blend briefly again.\n6. Pour into a glass and serve immediately."
    },
    {
      id: 4,
      title: "Vegetable Soup with Lentils",
      calories: "210 kcal",
      protein: "15g",
      time: "35 min",
      image: lentilSoup,
      ingredients: [
        "150g red lentils",
        "2 carrots",
        "1 celery",
        "1 onion",
        "2 cloves of garlic",
        "1 tablespoon tomato paste",
        "1 tablespoon olive oil",
        "1l vegetable broth",
        "salt, pepper, cumin"
      ],
      instructions: "1. Finely chop the onion and garlic and fry in olive oil.\n2. Add chopped carrots and celery, fry for 5 minutes.\n3. Add tomato paste and lentils.\n4. Pour vegetable broth and cook for 25-30 minutes.\n5. Season with salt, pepper and cumin.\n6. Optionally blend the soup or leave with vegetable pieces."
    },
    {
      id: 5,
      title: "Grilled Salmon with Brussels Sprouts",
      calories: "340 kcal",
      protein: "38g",
      time: "25 min",
      image: grilledSalmonBrussels,
      ingredients: [
        "200g salmon",
        "300g Brussels sprouts",
        "2 tablespoons olive oil",
        "1 lemon",
        "2 cloves of garlic",
        "salt, black pepper",
        "fresh dill"
      ],
      instructions: "1. Preheat oven to 200°C.\n2. Season salmon with salt, pepper and drizzle with lemon.\n3. Cut Brussels sprouts in half and toss with olive oil and pressed garlic.\n4. Place salmon and Brussels sprouts on a baking sheet lined with parchment paper.\n5. Bake for 18-20 minutes.\n6. Serve with fresh dill and lemon slices."
    },
    {
      id: 6,
      title: "Vegetable Wrap with Hummus",
      calories: "290 kcal",
      protein: "14g",
      time: "15 min",
      image: vegetableWrapHummus,
      ingredients: [
        "2 whole wheat tortillas",
        "100g hummus",
        "1 bell pepper",
        "1/2 cucumber",
        "50g baby spinach",
        "50g red cabbage",
        "1 carrot",
        "lemon juice"
      ],
      instructions: "1. Wash and cut vegetables into thin strips.\n2. Spread out tortillas and spread with hummus.\n3. On one half of the tortilla, place spinach and sliced vegetables.\n4. Drizzle with lemon juice.\n5. Roll the tortillas tightly.\n6. Cut in half and serve."
    },
    {
      id: 7,
      title: "Cottage Cheese with Cucumber and Tomatoes",
      calories: "180 kcal",
      protein: "20g",
      time: "10 min",
      image: cottageCheeseVegetables,
      ingredients: [
        "200g cottage cheese",
        "1 cucumber",
        "2 tomatoes",
        "spring onion",
        "fresh basil",
        "olive oil",
        "salt, pepper"
      ],
      instructions: "1. Wash and dice the cucumber and tomatoes.\n2. Slice the spring onion into rings.\n3. In a bowl, mix cottage cheese, chopped vegetables and onion.\n4. Add chopped basil.\n5. Season with salt, pepper and a drop of olive oil.\n6. Serve chilled."
    },
    {
      id: 8,
      title: "Spinach Omelette",
      calories: "240 kcal",
      protein: "22g",
      time: "12 min",
      image: spinachOmelette,
      ingredients: [
        "3 eggs",
        "100g fresh spinach",
        "30g feta cheese",
        "1 clove of garlic",
        "1 tablespoon olive oil",
        "salt, pepper"
      ],
      instructions: "1. Beat eggs in a bowl, season with salt and pepper.\n2. Wash and roughly chop the spinach.\n3. Heat olive oil in a pan and fry the pressed garlic.\n4. Add spinach and fry for 2 minutes.\n5. Pour in the beaten eggs and sprinkle with crumbled feta.\n6. Cook on medium heat for 5-7 minutes until the omelette sets."
    },
    {
      id: 9,
      title: "Tuna Chunks with Avocado",
      calories: "310 kcal",
      protein: "30g",
      time: "10 min",
      image: tunaAvocado,
      ingredients: [
        "150g canned tuna",
        "1 avocado",
        "50g cherry tomatoes",
        "lemon juice",
        "spring onion",
        "salt, pepper",
        "fresh parsley"
      ],
      instructions: "1. Drain tuna and flake with a fork.\n2. Halve avocado, remove pit and dice.\n3. Halve cherry tomatoes.\n4. Slice spring onion into rings.\n5. Mix all ingredients in a bowl.\n6. Season with lemon juice, salt and pepper, sprinkle with parsley."
    },
    {
      id: 10,
      title: "Chicken with Chili and Green Beans",
      calories: "295 kcal",
      protein: "32g",
      time: "22 min",
      image: chickenChiliBeans,
      ingredients: [
        "200g chicken breast",
        "200g green beans",
        "1 chili pepper",
        "2 cloves of garlic",
        "ginger",
        "soy sauce",
        "sesame oil",
        "salt, pepper"
      ],
      instructions: "1. Cut chicken into pieces and season.\n2. Clean and chop green beans.\n3. Heat sesame oil in a pan.\n4. Fry garlic, ginger and chili.\n5. Add chicken and fry for 10 minutes.\n6. Add beans, soy sauce and simmer for 8 minutes."
    },
    {
      id: 11,
      title: "Vegetable Curry with Chickpeas",
      calories: "265 kcal",
      protein: "16g",
      time: "28 min",
      image: vegetableCurryChickpeas,
      ingredients: [
        "200g chickpeas (canned)",
        "1 bell pepper",
        "1 zucchini",
        "1 onion",
        "400ml coconut milk",
        "2 tablespoons curry paste",
        "spinach",
        "salt, pepper"
      ],
      instructions: "1. Chop onion and fry in oil.\n2. Add curry paste and fry for 1 minute.\n3. Add chopped bell pepper and zucchini.\n4. Pour coconut milk and add drained chickpeas.\n5. Cook for 15 minutes on low heat.\n6. Finally add spinach and season to taste."
    },
    {
      id: 12,
      title: "Baked Cod with Lemon",
      calories: "260 kcal",
      protein: "34g",
      time: "20 min",
      image: bakedCodLemon,
      ingredients: [
        "200g cod fillet",
        "1 lemon",
        "2 cloves of garlic",
        "olive oil",
        "fresh thyme",
        "salt, pepper",
        "cherry tomatoes"
      ],
      instructions: "1. Preheat oven to 200°C.\n2. Place cod on a baking sheet, drizzle with olive oil.\n3. Season with salt, pepper, pressed garlic and thyme.\n4. Add lemon slices and cherry tomatoes.\n5. Bake for 15-18 minutes.\n6. Serve with fresh lemon."
    },
    {
      id: 13,
      title: "Tofu and Brown Rice Bowl",
      calories: "330 kcal",
      protein: "18g",
      time: "25 min",
      image: tofuBrownRiceBowl,
      ingredients: [
        "150g tofu",
        "100g brown rice",
        "50g edamame",
        "1 carrot",
        "red cabbage",
        "avocado",
        "soy sauce",
        "sesame seeds"
      ],
      instructions: "1. Cook brown rice according to instructions.\n2. Dice tofu and fry in a pan.\n3. Grate carrot, slice cabbage into strips.\n4. Cook edamame for 3-4 minutes.\n5. Put rice, tofu and vegetables in a bowl.\n6. Drizzle with soy sauce and sprinkle with sesame."
    },
    {
      id: 14,
      title: "Creamy Broccoli Soup",
      calories: "195 kcal",
      protein: "11g",
      time: "30 min",
      image: creamyBroccoliSoup,
      ingredients: [
        "400g broccoli",
        "1 potato",
        "1 onion",
        "2 cloves of garlic",
        "800ml vegetable broth",
        "100ml cooking cream",
        "olive oil",
        "salt, pepper"
      ],
      instructions: "1. Fry onion and garlic in oil.\n2. Add chopped potatoes and broccoli.\n3. Pour vegetable broth and cook for 20 minutes.\n4. Blend the soup until smooth.\n5. Add cream, season with salt and pepper.\n6. Serve with croutons."
    },
    {
      id: 15,
      title: "Herb Roasted Chicken",
      calories: "305 kcal",
      protein: "36g",
      time: "40 min",
      image: herbRoastedChicken,
      ingredients: [
        "250g chicken thighs",
        "rosemary, thyme",
        "3 cloves of garlic",
        "olive oil",
        "lemon",
        "salt, pepper",
        "potatoes"
      ],
      instructions: "1. Preheat oven to 190°C.\n2. Season chicken with salt, pepper, herbs and garlic.\n3. Drizzle with olive oil and lemon.\n4. Cut potatoes into wedges and add to the baking sheet.\n5. Bake for 35-40 minutes until the meat is golden.\n6. Serve with fresh herbs."
    },
    {
      id: 16,
      title: "Lentils with Tomatoes and Zucchini",
      calories: "245 kcal",
      protein: "17g",
      time: "32 min",
      image: lentilsTomatoesZucchini,
      ingredients: [
        "150g green lentils",
        "2 tomatoes",
        "1 zucchini",
        "1 onion",
        "2 cloves of garlic",
        "tomato paste",
        "olive oil",
        "salt, pepper, cumin"
      ],
      instructions: "1. Cook lentils according to instructions.\n2. Fry onion and garlic in oil.\n3. Add chopped zucchini and tomatoes.\n4. Add tomato paste and simmer for 10 minutes.\n5. Add cooked lentils and mix.\n6. Season with salt, pepper and cumin."
    },
    {
      id: 17,
      title: "Cabbage Salad with Turkey",
      calories: "270 kcal",
      protein: "28g",
      time: "18 min",
      image: cabbageSaladTurkey,
      ingredients: [
        "200g turkey meat",
        "200g white cabbage",
        "1 carrot",
        "spring onion",
        "lemon juice",
        "olive oil",
        "salt, pepper"
      ],
      instructions: "1. Cut turkey into pieces and fry.\n2. Grate cabbage and carrot.\n3. Chop spring onion.\n4. Mix vegetables with fried turkey.\n5. Prepare dressing from oil and lemon.\n6. Mix and serve."
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
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Fit & Slim
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your journey to a healthier lifestyle starts here. Find workouts, recipes and tips for better fitness.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="weight-loss-videos">
              <Play className="h-4 w-4 mr-2" />
              Weight Loss
            </TabsTrigger>
            <TabsTrigger value="health-videos">
              <Heart className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="weight-loss-recipes">
              <ChefHat className="h-4 w-4 mr-2" />
              Weight Loss Recipes
            </TabsTrigger>
            <TabsTrigger value="healthy-recipes">
              <ChefHat className="h-4 w-4 mr-2" />
              Healthy Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight-loss-videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>Difficulty: {video.difficulty}</span>
                      <span className="text-primary font-semibold">{video.calories}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health-videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription>
                      <span className="flex items-center justify-between">
                        <span>Difficulty: {video.difficulty}</span>
                        <span className="text-primary font-semibold flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {video.benefit}
                        </span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weight-loss-recipes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription>
                      <span className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold">{recipe.calories}</span>
                        <span>Protein: {recipe.protein}</span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="healthy-recipes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription>
                      <span className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold">{recipe.calories}</span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {recipe.benefit}
                        </span>
                      </span>
                    </CardDescription>
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
