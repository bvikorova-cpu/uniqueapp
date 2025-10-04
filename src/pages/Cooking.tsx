import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                          <Button size="sm" variant="premium">
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
      </div>
    </div>
  );
};

export default Cooking;
