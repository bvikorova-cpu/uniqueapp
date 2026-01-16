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
