import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Search, Sparkles, Calendar, Camera, Store, MessageCircle, Wine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import grilledChickenSalad from "@/assets/recipes/grilled-chicken-salad.jpg";
import lentilSoup from "@/assets/recipes/lentil-soup.jpg";
import bakedCodLemon from "@/assets/recipes/baked-cod-lemon.jpg";
import spinachQuiche from "@/assets/recipes/spinach-quiche.jpg";
import chiaPuddingMango from "@/assets/recipes/chia-pudding-mango.jpg";

interface Recipe {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  time: string;
  servings: number;
  calories: number;
  image_url: string;
  description: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
}

const categories = [
  "All",
  "Appetizers",
  "Main Dishes",
  "Desserts",
  "Soups",
  "Salads",
  "Pasta",
  "Pizza",
  "Pastries",
  "Drinks",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Fitness",
];

const COOKING_RECIPES: Recipe[] = [
  {
    id: "cook-001",
    title: "Grilled Chicken Salad with Citrus Vinaigrette",
    category: "Fitness",
    difficulty: "Easy",
    time: "25 min",
    servings: 2,
    calories: 380,
    image_url: grilledChickenSalad,
    description:
      "A bright, protein-forward salad with juicy grilled chicken, crisp greens, and a balanced citrus vinaigrette.",
    ingredients: [
      "300g chicken breast",
      "120g mixed baby greens",
      "150g cherry tomatoes",
      "120g cucumber",
      "60g red onion",
      "30ml extra virgin olive oil",
      "20ml fresh lemon juice",
      "10ml orange juice",
      "5g Dijon mustard",
      "3g sea salt",
      "2g freshly ground black pepper",
    ],
    instructions: [
      "Pat the 300g chicken breast dry, then season evenly with 2g black pepper and 2g of the salt to help the surface brown properly.",
      "Preheat a grill pan over medium-high heat until very hot; a properly heated pan prevents sticking and gives clean grill marks.",
      "Grill the chicken for 5–6 minutes per side, then rest it for 5 minutes so the juices redistribute and the meat stays tender.",
      "While the chicken rests, whisk 30ml olive oil, 20ml lemon juice, 10ml orange juice, and 5g Dijon mustard until emulsified and glossy.",
      "Slice the cucumber thinly, halve the cherry tomatoes, and shave the red onion into fine slices so each bite stays balanced.",
      "Toss the greens with half the vinaigrette first; coating leaves before adding heavier items keeps the salad light and evenly dressed.",
      "Slice the rested chicken across the grain, arrange it on top, then drizzle the remaining vinaigrette and finish with the last 1g salt to taste.",
    ],
    tags: ["high-protein", "fresh", "quick"],
  },
  {
    id: "cook-002",
    title: "Hearty Red Lentil Vegetable Soup",
    category: "Soups",
    difficulty: "Easy",
    time: "40 min",
    servings: 4,
    calories: 290,
    image_url: lentilSoup,
    description:
      "A restaurant-quality lentil soup that turns pantry staples into a silky, deeply savory bowl.",
    ingredients: [
      "200g red lentils",
      "120g yellow onion",
      "150g carrots",
      "100g celery",
      "10g garlic",
      "25ml olive oil",
      "30g tomato paste",
      "1200ml vegetable stock",
      "2g ground cumin",
      "1g smoked paprika",
      "3g sea salt",
      "2g freshly ground black pepper",
    ],
    instructions: [
      "Rinse the 200g red lentils in cold water until the runoff is mostly clear; this removes excess starch and keeps flavors clean.",
      "Heat 25ml olive oil in a pot over medium heat, then sweat the onion for 4–5 minutes until translucent but not browned.",
      "Add carrots and celery, stirring for 5 minutes to soften slightly and build a sweeter vegetable base.",
      "Stir in 30g tomato paste and cook for 60 seconds; caramelizing the paste concentrates sweetness and adds depth.",
      "Add garlic, cumin, and smoked paprika, stirring for 30 seconds until fragrant so the spices bloom in the fat.",
      "Pour in 1200ml stock and add lentils; bring to a gentle boil, then simmer 18–22 minutes until the lentils break down.",
      "Season with salt and pepper, then partially blend for a velvety body while leaving some texture for a professional finish.",
    ],
    tags: ["comfort", "high-fiber", "meal-prep"],
  },
  {
    id: "cook-003",
    title: "Lemon Herb Baked Cod with Asparagus",
    category: "Main Dishes",
    difficulty: "Medium",
    time: "25 min",
    servings: 2,
    calories: 360,
    image_url: bakedCodLemon,
    description:
      "Tender cod baked with lemon, garlic, and herbs alongside crisp-tender asparagus—clean, elegant, and fast.",
    ingredients: [
      "300g cod fillet",
      "250g asparagus",
      "30ml extra virgin olive oil",
      "12g garlic",
      "1 medium lemon (60g)",
      "6g fresh parsley",
      "4g fresh thyme",
      "3g sea salt",
      "2g freshly ground black pepper",
    ],
    instructions: [
      "Preheat the oven to 200°C and line a tray with parchment so the fish releases cleanly and cleanup is quick.",
      "Pat the 300g cod very dry; removing surface moisture helps it cook evenly and prevents steaming.",
      "Trim the woody ends from asparagus, then toss with 15ml olive oil, 1g salt, and 1g pepper to season from the start.",
      "Mix 15ml olive oil with 12g minced garlic, lemon zest, and thyme, then spread the mixture over the cod for concentrated flavor.",
      "Arrange asparagus in a single layer, place cod beside it, and top cod with lemon slices to gently perfume the fish.",
      "Bake 12–15 minutes until the cod flakes easily and asparagus is bright green and tender-crisp.",
      "Finish with lemon juice and parsley, then rest 2 minutes so the juices settle before serving.",
    ],
    tags: ["lean", "weeknight", "gluten-free"],
  },
  {
    id: "cook-004",
    title: "French Spinach and Gruyère Quiche",
    category: "Pastries",
    difficulty: "Hard",
    time: "60 min",
    servings: 6,
    calories: 420,
    image_url: spinachQuiche,
    description:
      "A classic quiche with a crisp pastry base and a silky custard set with spinach and nutty Gruyère.",
    ingredients: [
      "250g puff pastry",
      "200g baby spinach",
      "120g yellow onion",
      "15ml olive oil",
      "4 large eggs (220g)",
      "200ml heavy cream",
      "120g Gruyère cheese",
      "3g sea salt",
      "2g freshly ground black pepper",
      "1g ground nutmeg",
    ],
    instructions: [
      "Preheat the oven to 180°C and press 250g puff pastry into a 23cm tart pan; chill 10 minutes so the butter stays cold.",
      "Blind bake the crust for 12 minutes with parchment and weights; this prevents a soggy base and keeps layers crisp.",
      "Sauté onion in 15ml olive oil for 5 minutes until sweet and translucent, then add spinach and cook just until wilted.",
      "Drain the spinach mixture well and squeeze out excess moisture; water is the enemy of a clean custard set.",
      "Whisk eggs, cream, salt, pepper, and nutmeg until smooth to create a uniform custard that bakes evenly.",
      "Scatter spinach and 120g Gruyère into the crust, then pour custard slowly to avoid displacing fillings.",
      "Bake 30–35 minutes until the center is just set with a slight wobble; rest 10 minutes to finish setting before slicing.",
    ],
    tags: ["brunch", "classic", "vegetarian"],
  },
  {
    id: "cook-005",
    title: "Mango Chia Pudding with Toasted Coconut",
    category: "Desserts",
    difficulty: "Easy",
    time: "10 min + chill",
    servings: 2,
    calories: 320,
    image_url: chiaPuddingMango,
    description:
      "A creamy, naturally sweet chia pudding layered with mango for a clean, modern dessert or breakfast.",
    ingredients: [
      "60g chia seeds",
      "400ml coconut milk",
      "15ml maple syrup",
      "1g sea salt",
      "200g mango",
      "20g toasted coconut flakes",
      "5ml vanilla extract",
    ],
    instructions: [
      "Whisk 400ml coconut milk, 15ml maple syrup, 5ml vanilla, and 1g salt until fully combined so sweetness is evenly distributed.",
      "Stir in 60g chia seeds, whisking vigorously for 30 seconds to prevent clumping and ensure a smooth set.",
      "Wait 5 minutes, then whisk again; the second whisk breaks up early gels and creates a more professional texture.",
      "Cover and chill for at least 2 hours (or overnight) until thick and spoonable.",
      "Dice 200g mango into small cubes so it layers neatly and distributes evenly in each bite.",
      "Layer pudding and mango in glasses, pressing gently to remove large air pockets for a clean presentation.",
      "Finish with 20g toasted coconut flakes right before serving so the topping stays crisp.",
    ],
    tags: ["no-bake", "make-ahead", "gluten-free"],
  },
  {
    id: "cook-006",
    title: "Thai Green Curry with Jasmine Rice",
    category: "Main Dishes",
    difficulty: "Medium",
    time: "45 min",
    servings: 4,
    calories: 520,
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800",
    description:
      "An aromatic Thai curry with tender chicken, fresh vegetables, and creamy coconut milk served over fragrant jasmine rice.",
    ingredients: [
      "400g chicken thigh fillets",
      "400ml coconut milk",
      "60g Thai green curry paste",
      "200g Thai eggplant or regular eggplant",
      "150g bamboo shoots",
      "100g green beans",
      "30ml fish sauce",
      "15g palm sugar or brown sugar",
      "6 kaffir lime leaves",
      "30g Thai basil leaves",
      "300g jasmine rice",
      "15ml vegetable oil",
    ],
    instructions: [
      "Rinse 300g jasmine rice until water runs clear, then cook with 450ml water; bring to boil, reduce heat, cover and simmer 12 minutes, then rest 5 minutes.",
      "Slice 400g chicken thigh into 2cm pieces; thigh meat stays juicier than breast in curries due to higher fat content.",
      "Heat 15ml oil in a wok over medium-high heat, add 60g curry paste and fry for 60 seconds until fragrant and oils separate.",
      "Pour in 200ml coconut milk (the thick part from top of can) and stir continuously until it splits and becomes oily.",
      "Add chicken pieces and cook for 4 minutes, stirring frequently so every piece gets coated in the curry paste.",
      "Add remaining 200ml coconut milk, eggplant, bamboo shoots, fish sauce, and sugar; simmer 10 minutes until vegetables are tender.",
      "Add green beans and kaffir lime leaves, cook 3 more minutes, then finish with Thai basil just before serving over jasmine rice.",
    ],
    tags: ["spicy", "asian", "comfort"],
  },
  {
    id: "cook-007",
    title: "Classic Beef Wellington",
    category: "Main Dishes",
    difficulty: "Hard",
    time: "90 min",
    servings: 6,
    calories: 680,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    description:
      "An elegant beef tenderloin wrapped in mushroom duxelles, prosciutto, and golden puff pastry—the ultimate showstopper.",
    ingredients: [
      "800g beef tenderloin center-cut",
      "400g cremini mushrooms",
      "100g shallots",
      "80g prosciutto slices",
      "500g puff pastry sheet",
      "30ml olive oil",
      "30g Dijon mustard",
      "4 egg yolks (80g)",
      "10g fresh thyme",
      "6g sea salt",
      "4g freshly ground black pepper",
      "30ml Madeira wine",
    ],
    instructions: [
      "Season 800g beef with 4g salt and 2g pepper; sear in 30ml hot oil for 60 seconds per side until deeply browned, then cool completely.",
      "Pulse 400g mushrooms in food processor until finely chopped; cook in dry pan over high heat for 12 minutes until all moisture evaporates.",
      "Add 100g minced shallots and 10g thyme to mushrooms, cook 3 minutes, then deglaze with 30ml Madeira and cool the duxelles completely.",
      "Lay plastic wrap on counter, shingle 80g prosciutto in rectangle, spread duxelles evenly on top, leaving 2cm border on all sides.",
      "Brush cooled beef with 30g Dijon mustard, place on duxelles, then roll tightly using plastic wrap; refrigerate 30 minutes to set shape.",
      "Roll 500g puff pastry to 5mm thickness, unwrap beef roll, place on pastry, fold and seal edges with egg wash, then score decoratively.",
      "Brush with egg wash, chill 15 minutes, then bake at 220°C for 25-30 minutes until pastry is deep golden and internal temp reaches 52°C for medium-rare.",
    ],
    tags: ["gourmet", "special-occasion", "british"],
  },
  {
    id: "cook-008",
    title: "Quinoa Buddha Bowl with Tahini Dressing",
    category: "Vegetarian",
    difficulty: "Easy",
    time: "35 min",
    servings: 2,
    calories: 450,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    description:
      "A nourishing bowl packed with roasted vegetables, protein-rich quinoa, chickpeas, and a creamy lemon-tahini dressing.",
    ingredients: [
      "150g dry quinoa",
      "200g sweet potato",
      "200g broccoli florets",
      "150g canned chickpeas",
      "100g red cabbage",
      "1 medium avocado (150g)",
      "60g tahini",
      "30ml fresh lemon juice",
      "15ml maple syrup",
      "10g garlic",
      "30ml olive oil",
      "4g sea salt",
      "2g ground cumin",
    ],
    instructions: [
      "Preheat oven to 200°C; rinse 150g quinoa and cook with 300ml water for 15 minutes, then fluff with fork and set aside.",
      "Cube 200g sweet potato into 2cm pieces, toss with 15ml olive oil and 1g salt, roast for 20 minutes until caramelized edges form.",
      "Toss 200g broccoli with remaining oil and 1g salt, add to baking sheet for final 12 minutes of sweet potato roasting time.",
      "Whisk 60g tahini, 30ml lemon juice, 15ml maple syrup, 10g minced garlic, 2g cumin, and 45ml warm water until smooth and pourable.",
      "Shred 100g red cabbage finely for color and crunch; drain and rinse 150g chickpeas, then pat dry.",
      "Slice 150g avocado just before assembling to prevent browning; fan slices for an elegant presentation.",
      "Arrange quinoa as base, add roasted vegetables, chickpeas, cabbage, and avocado in sections, then drizzle generously with tahini dressing.",
    ],
    tags: ["plant-based", "meal-prep", "healthy"],
  },
  {
    id: "cook-009",
    title: "Authentic Italian Lasagna Bolognese",
    category: "Pasta",
    difficulty: "Hard",
    time: "120 min",
    servings: 8,
    calories: 580,
    image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800",
    description:
      "Layers of silky béchamel, rich meat ragù, and fresh pasta sheets baked until golden and bubbling—true Italian comfort.",
    ingredients: [
      "500g ground beef",
      "200g ground pork",
      "400g canned San Marzano tomatoes",
      "150g yellow onion",
      "100g carrots",
      "80g celery",
      "120ml dry red wine",
      "500ml whole milk",
      "60g butter",
      "50g all-purpose flour",
      "100g Parmigiano-Reggiano",
      "300g fresh lasagna sheets",
      "30ml olive oil",
      "5g sea salt",
      "2g freshly ground black pepper",
      "1g ground nutmeg",
    ],
    instructions: [
      "Finely dice 150g onion, 100g carrots, and 80g celery (soffritto); sauté in 30ml olive oil over medium heat for 10 minutes until soft.",
      "Add 500g beef and 200g pork, break apart with wooden spoon, cook 8 minutes until browned; pour in 120ml wine and simmer until evaporated.",
      "Crush 400g tomatoes by hand, add to pot with 3g salt and 1g pepper; simmer uncovered for 60 minutes, stirring occasionally, until thick.",
      "Make béchamel: melt 60g butter, whisk in 50g flour for 2 minutes, gradually add 500ml warm milk whisking constantly until smooth and thick.",
      "Season béchamel with 2g salt, 1g pepper, and 1g nutmeg; cook 3 more minutes until it coats the back of a spoon cleanly.",
      "Spread thin layer of ragù in 23x33cm baking dish, add pasta sheet, then ragù, béchamel, and 25g Parmigiano; repeat 4 layers.",
      "Finish with béchamel and remaining cheese; bake at 180°C for 40 minutes until golden and bubbling, rest 15 minutes before cutting.",
    ],
    tags: ["comfort", "italian", "make-ahead"],
  },
  {
    id: "cook-010",
    title: "Eggs Benedict with Hollandaise",
    category: "Appetizers",
    difficulty: "Medium",
    time: "30 min",
    servings: 2,
    calories: 490,
    image_url: "https://images.unsplash.com/photo-1608039829572-9b5bfcc4e0d4?w=800",
    description:
      "Perfectly poached eggs on toasted English muffins with Canadian bacon, topped with silky, buttery hollandaise sauce.",
    ingredients: [
      "4 large eggs (220g)",
      "2 English muffins",
      "100g Canadian bacon (4 slices)",
      "150g unsalted butter",
      "3 egg yolks (60g)",
      "20ml fresh lemon juice",
      "30ml white vinegar",
      "2g cayenne pepper",
      "3g sea salt",
      "10g fresh chives",
    ],
    instructions: [
      "Clarify 150g butter by melting slowly and skimming foam; pour off golden liquid, leaving milk solids behind for cleaner sauce.",
      "Whisk 3 egg yolks and 20ml lemon juice in heatproof bowl over simmering water; whisk constantly until thick and doubled in volume.",
      "Remove from heat and slowly drizzle in warm clarified butter while whisking; add 1g salt and 2g cayenne for seasoning.",
      "Bring large pot of water to gentle simmer, add 30ml vinegar; vinegar helps egg whites set faster for neater poached eggs.",
      "Create gentle whirlpool, crack eggs one at a time into center; poach 3 minutes for runny yolk, then lift with slotted spoon.",
      "Toast English muffins until golden, warm 100g Canadian bacon in dry pan for 60 seconds per side until lightly caramelized.",
      "Assemble: muffin base, bacon slice, poached egg, generous spoon of hollandaise; garnish with 10g minced chives and remaining salt.",
    ],
    tags: ["brunch", "classic", "indulgent"],
  },
  {
    id: "cook-011",
    title: "Creamy Wild Mushroom Risotto",
    category: "Main Dishes",
    difficulty: "Medium",
    time: "45 min",
    servings: 4,
    calories: 420,
    image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800",
    description:
      "Arborio rice slowly cooked with white wine and stock, finished with wild mushrooms, Parmesan, and fresh herbs.",
    ingredients: [
      "300g arborio rice",
      "350g mixed wild mushrooms",
      "1000ml vegetable or chicken stock",
      "150ml dry white wine",
      "100g yellow onion",
      "80g Parmigiano-Reggiano",
      "60g unsalted butter",
      "30ml olive oil",
      "10g garlic",
      "10g fresh thyme",
      "4g sea salt",
      "2g freshly ground black pepper",
    ],
    instructions: [
      "Keep 1000ml stock warm in separate pot; adding cold stock shocks the rice and disrupts the creamy starch release essential for risotto.",
      "Sauté 350g sliced mushrooms in 15ml oil over high heat for 5 minutes until golden; set aside to preserve their meaty texture.",
      "In same pan, melt 30g butter with 15ml oil, cook 100g diced onion for 4 minutes, add 10g garlic for 30 seconds until fragrant.",
      "Add 300g arborio rice, toast for 2 minutes stirring constantly until edges become translucent; this seals starches for better texture.",
      "Pour in 150ml wine and stir until absorbed; add stock one ladle (120ml) at a time, stirring constantly and waiting until absorbed.",
      "Continue adding stock for 18-20 minutes until rice is creamy but still has slight bite (al dente) in center of each grain.",
      "Remove from heat, fold in reserved mushrooms, 30g butter, 80g grated Parmesan, thyme, salt, and pepper; rest 2 minutes before serving.",
    ],
    tags: ["italian", "comfort", "vegetarian"],
  },
  {
    id: "cook-012",
    title: "Korean Beef Bulgogi with Pickled Vegetables",
    category: "Main Dishes",
    difficulty: "Medium",
    time: "40 min",
    servings: 4,
    calories: 480,
    image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800",
    description:
      "Thinly sliced beef marinated in sweet soy-pear sauce, grilled until caramelized, served with quick-pickled vegetables.",
    ingredients: [
      "600g beef sirloin",
      "1 Asian pear (200g)",
      "60ml soy sauce",
      "30ml sesame oil",
      "45g brown sugar",
      "20g garlic",
      "15g fresh ginger",
      "200g daikon radish",
      "150g carrots",
      "60ml rice vinegar",
      "15g sugar for pickle",
      "30g green onions",
      "10g toasted sesame seeds",
    ],
    instructions: [
      "Freeze 600g beef for 20 minutes to firm; slice against the grain into 3mm sheets for tender, quick-cooking strips.",
      "Grate 200g Asian pear (enzymes tenderize meat), combine with 60ml soy sauce, 30ml sesame oil, 45g sugar, garlic, and ginger in bowl.",
      "Add sliced beef to marinade, massage thoroughly, refrigerate at least 30 minutes or up to 4 hours for deeper flavor penetration.",
      "Julienne 200g daikon and 150g carrots; toss with 60ml rice vinegar, 15g sugar, and 3g salt; pickle 20 minutes minimum.",
      "Heat grill pan or cast iron to very high heat; cook beef in batches for 90 seconds per side to get proper char without steaming.",
      "Don't overcrowd pan—overcrowding drops temperature and causes meat to steam rather than caramelize properly.",
      "Plate beef over rice, top with drained pickled vegetables, 30g sliced green onions, and 10g toasted sesame seeds for crunch.",
    ],
    tags: ["korean", "bbq", "marinated"],
  },
  {
    id: "cook-013",
    title: "Mediterranean Grilled Lamb Chops",
    category: "Main Dishes",
    difficulty: "Medium",
    time: "35 min",
    servings: 2,
    calories: 520,
    image_url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800",
    description:
      "Herb-crusted lamb chops grilled to pink perfection, served with lemon, garlic, and a fresh mint yogurt sauce.",
    ingredients: [
      "6 lamb rib chops (500g)",
      "30ml olive oil",
      "15g fresh rosemary",
      "10g fresh mint",
      "12g garlic",
      "1 medium lemon (60g)",
      "150g Greek yogurt",
      "4g sea salt",
      "3g freshly ground black pepper",
      "2g dried oregano",
    ],
    instructions: [
      "Remove 500g lamb chops from refrigerator 30 minutes before cooking; room temperature meat cooks more evenly throughout.",
      "Finely chop 15g rosemary and 8g garlic; combine with 30ml olive oil, 2g oregano, lemon zest, 2g salt, and 2g pepper in bowl.",
      "Rub herb mixture generously on both sides of each chop; let sit 10 minutes so flavors penetrate the meat surface.",
      "Preheat grill or cast iron pan to high heat; sear chops 3 minutes per side for medium-rare (internal temp 57°C).",
      "Rest chops for 5 minutes tented loosely with foil; resting redistributes juices so they don't run out when cutting.",
      "Make sauce: whisk 150g yogurt with 10g chopped mint, 4g minced garlic, 15ml lemon juice, and remaining salt.",
      "Plate chops with generous dollop of mint yogurt, extra lemon wedges, and fresh mint leaves for aromatic garnish.",
    ],
    tags: ["grilled", "mediterranean", "high-protein"],
  },
  {
    id: "cook-014",
    title: "Spicy Shrimp Tacos with Mango Salsa",
    category: "Main Dishes",
    difficulty: "Easy",
    time: "25 min",
    servings: 4,
    calories: 380,
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
    description:
      "Chili-lime marinated shrimp in warm tortillas topped with fresh mango salsa, creamy avocado, and tangy lime crema.",
    ingredients: [
      "400g large shrimp, peeled and deveined",
      "8 small flour tortillas",
      "200g ripe mango",
      "100g red onion",
      "30g fresh cilantro",
      "2 limes (60g juice)",
      "1 medium jalapeño (15g)",
      "1 medium avocado (150g)",
      "120g sour cream",
      "10g chili powder",
      "5g ground cumin",
      "4g sea salt",
      "30ml olive oil",
    ],
    instructions: [
      "Toss 400g shrimp with 10g chili powder, 5g cumin, 2g salt, 15ml lime juice, and 15ml olive oil; marinate 10 minutes.",
      "Dice 200g mango, 50g red onion, and 15g jalapeño (seeds removed for less heat); combine with 15g cilantro and 15ml lime juice.",
      "Mash 150g avocado with fork, season with 1g salt; whisk 120g sour cream with 15ml lime juice and remaining salt for crema.",
      "Heat 15ml oil in large skillet over high heat; cook shrimp 90 seconds per side until pink and slightly charred.",
      "Warm tortillas in dry pan for 20 seconds per side; this makes them pliable and brings out their wheaty flavor.",
      "Build tacos: tortilla base, 3-4 shrimp per taco, spoonful of mango salsa, smashed avocado, and drizzle of lime crema.",
      "Garnish with remaining cilantro leaves and lime wedges; serve immediately while shrimp are still hot and tortillas warm.",
    ],
    tags: ["mexican", "seafood", "quick"],
  },
  {
    id: "cook-015",
    title: "Classic French Onion Soup",
    category: "Soups",
    difficulty: "Medium",
    time: "75 min",
    servings: 4,
    calories: 340,
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    description:
      "Deeply caramelized onions in rich beef broth, topped with crusty bread and melted Gruyère—comfort in a bowl.",
    ingredients: [
      "1000g yellow onions",
      "60g unsalted butter",
      "30ml olive oil",
      "1200ml beef stock",
      "150ml dry white wine",
      "15g all-purpose flour",
      "4 slices crusty baguette (120g)",
      "200g Gruyère cheese",
      "10g fresh thyme",
      "2 bay leaves",
      "5g sea salt",
      "3g freshly ground black pepper",
    ],
    instructions: [
      "Slice 1000g onions into thin half-moons; even thickness ensures uniform caramelization and prevents some pieces from burning.",
      "Melt 60g butter with 30ml oil in large Dutch oven over medium heat; add onions and 3g salt, stir to coat evenly.",
      "Cook onions for 45-50 minutes, stirring every 5 minutes; patience here creates the deep amber color and sweet flavor.",
      "When onions are mahogany brown, sprinkle 15g flour, stir 2 minutes; add 150ml wine and scrape up all caramelized bits.",
      "Pour in 1200ml stock, add thyme and bay leaves; simmer 20 minutes to meld flavors, then season with remaining salt and pepper.",
      "Toast 120g baguette slices, ladle soup into oven-safe crocks, top each with bread slice and 50g grated Gruyère.",
      "Broil 3-4 minutes until cheese is bubbling and golden brown; serve immediately with warning that bowls are extremely hot.",
    ],
    tags: ["french", "comfort", "winter"],
  },
];

const Cooking = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const recipes = COOKING_RECIPES;
  const totalRecipes = recipes.length;

  const aiFeatures = [
    {
      icon: Sparkles,
      title: "Recipe Generator",
      description: "AI generates recipes from your ingredients",
      path: "/recipe-generator",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Calendar,
      title: "Meal Planner",
      description: "Personalized weekly meal plan",
      path: "/meal-planner",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Camera,
      title: "Food Scanner",
      description: "Scan food and get nutritional info",
      path: "/food-scanner",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Store,
      title: "Menu Analyzer",
      description: "Analyze restaurant menus",
      path: "/restaurant-analyzer",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageCircle,
      title: "AI Chef Chat",
      description: "Chat with AI chef",
      path: "/chef-chat",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Wine,
      title: "Wine Pairing",
      description: "Find perfect wine for your food",
      path: "/wine-pairing",
      color: "from-red-500 to-rose-500",
    },
  ];

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, selectedCategory]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "Hard":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-950/30 px-6 pb-10 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 relative">
              <ChefHat className="h-10 w-10 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/20 to-red-500/20 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                AI Culinary Academy
              </h1>
              <p className="text-muted-foreground text-lg">Your personal AI-powered kitchen assistant</p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/30 backdrop-blur-sm mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">{totalRecipes}+</div>
                  <div className="text-sm text-muted-foreground">Premium Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">6</div>
                  <div className="text-sm text-muted-foreground">AI Cooking Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">14</div>
                  <div className="text-sm text-muted-foreground">Recipe Categories</div>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-4 max-w-3xl mx-auto">
                Welcome to the ultimate culinary experience. Discover world-class recipes, generate custom meals from your ingredients,
                scan food for instant nutrition facts, and chat with our AI chef for expert guidance.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search recipes..."
              className="pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                <Sparkles className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI Cooking Tools</h2>
                <p className="text-muted-foreground text-sm">6 powerful AI-powered features at your fingertips</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/cooking-ai")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              View All Tools
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {aiFeatures.map((feature, idx) => (
              <Card
                key={idx}
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-orange-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-orange-500/10 group"
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                  <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">AI Powered</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto gap-1 sm:gap-2 bg-transparent p-1">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap flex-shrink-0"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-orange-500/50 group transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-orange-500/10"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getDifficultyColor(recipe.difficulty)} backdrop-blur-sm`}>{recipe.difficulty}</Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-orange-500/90 text-white border-0">{recipe.category}</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1 text-lg group-hover:text-orange-400 transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-orange-400">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                        🔥 {recipe.calories} kcal
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        onClick={() => handleRecipeClick(recipe)}
                      >
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
                <p className="text-muted-foreground">Try changing the search term or category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{totalRecipes}+ Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Curated recipes crafted for a premium cooking experience</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>For Everyone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">From beginners to experienced home chefs</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Technique-First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Step-by-step instructions designed for repeatable results</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedRecipe?.title}</DialogTitle>
            </DialogHeader>

            {selectedRecipe && (
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-6">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedRecipe.image_url}
                      alt={selectedRecipe.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <Button size="sm" variant="premium" className="pointer-events-none">
                        {selectedRecipe.difficulty}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <span>{selectedRecipe.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{selectedRecipe.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedRecipe.calories} kcal</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground">{selectedRecipe.description}</p>
                  </div>

                  {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Preparation Instructions</h3>
                      <ol className="space-y-3">
                        {selectedRecipe.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <span className="flex-1 pt-0.5">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Cooking;
