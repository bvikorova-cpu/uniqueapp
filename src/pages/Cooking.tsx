import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Search, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  "Všetko",
  "Predjedlá",
  "Hlavné jedlá",
  "Dezerty",
  "Polievky",
  "Šaláty",
  "Cestoviny",
  "Pizza",
  "Múčniky",
  "Nápoje",
  "Vegetariánske",
  "Vegánske",
  "Bezlepkové",
  "Fitness",
];

const Cooking = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Všetko");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importCategory, setImportCategory] = useState("Seafood");
  const [importLimit, setImportLimit] = useState(20);

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
        title: "Chyba",
        description: "Nepodarilo sa načítať recepty",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Všetko" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleImportRecipes = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-recipes', {
        body: { category: importCategory, limit: importLimit }
      });

      if (error) throw error;

      toast({
        title: "Import úspešný!",
        description: `Importovaných: ${data.imported} receptov, Chyby: ${data.errors}`,
      });

      // Refresh recipes list
      fetchRecipes();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Chyba pri importe",
        description: "Nepodarilo sa importovať recepty",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Ľahké":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Stredné":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "Náročné":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "";
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
            Varenie a recepty
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Objavte tisíce receptov pre každú príležitosť - od rýchlych jedál až po gurmánske pokrmy
          </p>
          <Badge variant="secondary" className="mt-4 text-lg px-4 py-2">
            {totalRecipes}+ receptov
          </Badge>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Hľadať recepty..."
              className="pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Import Section */}
        <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Import receptov z TheMealDB</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={importCategory} onValueChange={setImportCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Kategória" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beef">Beef (Hovädzie)</SelectItem>
                    <SelectItem value="Breakfast">Breakfast (Raňajky)</SelectItem>
                    <SelectItem value="Chicken">Chicken (Kura)</SelectItem>
                    <SelectItem value="Dessert">Dessert (Dezerty)</SelectItem>
                    <SelectItem value="Goat">Goat (Koza)</SelectItem>
                    <SelectItem value="Lamb">Lamb (Jahňa)</SelectItem>
                    <SelectItem value="Miscellaneous">Miscellaneous (Rôzne)</SelectItem>
                    <SelectItem value="Pasta">Pasta (Cestoviny)</SelectItem>
                    <SelectItem value="Pork">Pork (Bravčové)</SelectItem>
                    <SelectItem value="Seafood">Seafood (Morské plody)</SelectItem>
                    <SelectItem value="Side">Side (Prílohy)</SelectItem>
                    <SelectItem value="Starter">Starter (Predjedlá)</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian (Vegetariánske)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={importLimit}
                  onChange={(e) => setImportLimit(parseInt(e.target.value) || 20)}
                  className="w-full sm:w-[120px]"
                  placeholder="Počet"
                />
                <Button 
                  onClick={handleImportRecipes} 
                  disabled={isImporting}
                  className="gap-2 bg-gradient-primary hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  {isImporting ? "Importujem..." : "Importovať"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Importujte recepty s detailnými ingredienciami a postupmi z TheMealDB API
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Načítavam recepty...</p>
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
                        <Badge className={`absolute top-2 right-2 ${getDifficultyColor(recipe.difficulty)}`}>
                          {recipe.difficulty}
                        </Badge>
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
                            <span>{recipe.servings} porcie</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{recipe.calories} kcal</Badge>
                          <Button 
                            size="sm" 
                            variant="premium"
                            onClick={() => handleRecipeClick(recipe)}
                          >
                            Pozrieť recept
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredRecipes.length === 0 && (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenašli sa žiadne recepty</h3>
                    <p className="text-muted-foreground">
                      Skúste zmeniť vyhľadávací výraz alebo kategóriu
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
              <CardTitle>{totalRecipes}+ Receptov</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Široká databáza receptov pre každú príležitosť
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Pre každého</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Od začiatočníkov po skúsených kuchárov
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Rýchle & Jednoduché</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Podrobné návody krok za krokom
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
                    <Badge 
                      className={`absolute top-4 right-4 ${getDifficultyColor(selectedRecipe.difficulty)}`}
                    >
                      {selectedRecipe.difficulty}
                    </Badge>
                  </div>

                  {/* Recipe Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <span>{selectedRecipe.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{selectedRecipe.servings} porcie</span>
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
                      <h3 className="text-xl font-semibold mb-4">Ingrediencie</h3>
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
                      <h3 className="text-xl font-semibold mb-4">Postup prípravy</h3>
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
