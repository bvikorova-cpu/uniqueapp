import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Search, Plus, Sparkles, Calendar, Camera, Store, MessageCircle, Wine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddRecipeForm } from "@/components/recipes/AddRecipeForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Cooking = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const aiFeatures = [
    {
      icon: Sparkles,
      title: "Recipe Generator",
      description: "AI generates recipes from your ingredients",
      path: "/recipe-generator",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Calendar,
      title: "Meal Planner",
      description: "Personalized weekly meal plan",
      path: "/meal-planner",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Camera,
      title: "Food Scanner",
      description: "Scan food and get nutritional info",
      path: "/food-scanner",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Store,
      title: "Menu Analyzer",
      description: "Analyze restaurant menus",
      path: "/restaurant-analyzer",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageCircle,
      title: "AI Chef Chat",
      description: "Chat with AI chef",
      path: "/chef-chat",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Wine,
      title: "Wine Pairing",
      description: "Find perfect wine for your food",
      path: "/wine-pairing",
      color: "from-red-500 to-rose-500"
    }
  ];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecipes(data || []);
      setTotalRecipes(count || 0);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Cooking & Recipes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover recipes for every occasion - from quick meals to gourmet dishes
          </p>
          <Badge variant="secondary" className="mt-4 text-lg px-4 py-2">
            {totalRecipes}+ recipes
          </Badge>
        </div>

        {/* Search */}
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

        {/* Add Recipe Button */}
        <div className="max-w-2xl mx-auto mb-8 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-gradient-primary hover:opacity-90">
                <Plus className="h-5 w-5" />
                Add Your Own Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <AddRecipeForm onSuccess={fetchRecipes} />
            </DialogContent>
          </Dialog>
        </div>

        {/* AI Features Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Cooking Tools
              </h2>
              <p className="text-muted-foreground mb-4">Try our AI-powered features that make cooking easier and more enjoyable</p>
              <div className="text-sm text-muted-foreground space-y-1 max-w-3xl">
                <p>• <strong>Recipe Generator:</strong> Enter ingredients you have at home and AI creates custom recipes</p>
                <p>• <strong>Meal Planner:</strong> Get personalized weekly meal plans based on your dietary preferences and calorie goals</p>
                <p>• <strong>Food Scanner:</strong> Take a photo of your meal to instantly analyze nutritional values and calories</p>
                <p>• <strong>Menu Analyzer:</strong> Upload restaurant menus for healthy recommendations and allergen information</p>
                <p>• <strong>AI Chef Chat:</strong> Ask cooking questions and get expert advice from our AI chef assistant</p>
                <p>• <strong>Wine Pairing:</strong> Discover perfect wine and beverage matches for your dishes</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/cooking-ai')}
              className="gap-2"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {aiFeatures.map((feature, idx) => (
              <Card 
                key={idx}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-2 sm:p-4 text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading recipes...</p>
              </div>
            ) : (
              <>
                {/* Recipe Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
                      <div className="relative overflow-hidden">
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Button 
                            size="sm" 
                            variant="premium"
                            className="pointer-events-none"
                          >
                            {recipe.difficulty}
                          </Button>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{recipe.servings} servings</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{recipe.calories} kcal</Badge>
                          <Button 
                            size="sm" 
                            variant="premium"
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
                    <p className="text-muted-foreground">
                      Try changing the search term or category
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{totalRecipes}+ Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Wide database of recipes for every occasion
              </p>
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
              <p className="text-muted-foreground">
                From beginners to experienced chefs
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Quick & Easy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed step-by-step instructions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recipe Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedRecipe?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedRecipe && (
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-6">
                  {/* Recipe Image */}
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedRecipe.image_url}
                      alt={selectedRecipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Button 
                        size="sm" 
                        variant="premium"
                        className="pointer-events-none"
                      >
                        {selectedRecipe.difficulty}
                      </Button>
                    </div>
                  </div>

                  {/* Recipe Info */}
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

                  {/* Description */}
                  <div>
                    <p className="text-muted-foreground">{selectedRecipe.description}</p>
                  </div>

                  {/* Tags */}
                  {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Ingredients */}
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

                  {/* Instructions */}
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
