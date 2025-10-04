import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recipe {
  id: number;
  title: string;
  category: string;
  difficulty: "Ľahké" | "Stredné" | "Náročné";
  time: string;
  servings: number;
  calories: number;
  imageUrl: string;
  description: string;
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

const sampleRecipes: Recipe[] = [
  {
    id: 1,
    title: "Sviečková na smotane",
    category: "Hlavné jedlá",
    difficulty: "Náročné",
    time: "2 hod 30 min",
    servings: 4,
    calories: 520,
    imageUrl: "https://images.unsplash.com/photo-1603073163308-9c4f1678d9c0",
    description: "Klasické české jedlo s hovädzím mäsom a smotanovou omáčkou",
  },
  {
    id: 2,
    title: "Caprese šalát",
    category: "Šaláty",
    difficulty: "Ľahké",
    time: "15 min",
    servings: 2,
    calories: 220,
    imageUrl: "https://images.unsplash.com/photo-1592417817038-d13fd7342e31",
    description: "Talianske paradajky s mozzarellou a bazalkou",
  },
  {
    id: 3,
    title: "Čokoládová torta",
    category: "Dezerty",
    difficulty: "Stredné",
    time: "1 hod 20 min",
    servings: 8,
    calories: 450,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    description: "Bohatá čokoládová torta s krémom",
  },
  {
    id: 4,
    title: "Kurací vývar",
    category: "Polievky",
    difficulty: "Ľahké",
    time: "1 hod",
    servings: 6,
    calories: 180,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    description: "Tradičný kurací vývar s rezancami",
  },
  {
    id: 5,
    title: "Margherita pizza",
    category: "Pizza",
    difficulty: "Stredné",
    time: "45 min",
    servings: 4,
    calories: 380,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
    description: "Klasická talianska pizza s paradajkami a bazalkou",
  },
  {
    id: 6,
    title: "Carbonara",
    category: "Cestoviny",
    difficulty: "Stredné",
    time: "30 min",
    servings: 2,
    calories: 620,
    imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3",
    description: "Rímske cestoviny so slaninou a vajcami",
  },
  {
    id: 7,
    title: "Smoothie bowl",
    category: "Fitness",
    difficulty: "Ľahké",
    time: "10 min",
    servings: 1,
    calories: 280,
    imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733",
    description: "Zdravá misa plná ovocia a superfood prísad",
  },
  {
    id: 8,
    title: "Vegánske burger",
    category: "Vegánske",
    difficulty: "Stredné",
    time: "40 min",
    servings: 4,
    calories: 420,
    imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360",
    description: "Šťavnatý burger z čiernych fazulí",
  },
  {
    id: 9,
    title: "Tiramisu",
    category: "Dezerty",
    difficulty: "Stredné",
    time: "30 min + chlad",
    servings: 6,
    calories: 390,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
    description: "Taliansky dezert s mascarpone a kávou",
  },
  {
    id: 10,
    title: "Guacamole",
    category: "Predjedlá",
    difficulty: "Ľahké",
    time: "10 min",
    servings: 4,
    calories: 160,
    imageUrl: "https://images.unsplash.com/photo-1601026296557-9e2f22c4ef05",
    description: "Mexická omáčka z avokáda",
  },
  {
    id: 11,
    title: "Panna cotta",
    category: "Dezerty",
    difficulty: "Stredné",
    time: "20 min + chlad",
    servings: 4,
    calories: 320,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777",
    description: "Taliansky krémový dezert s ovocím",
  },
  {
    id: 12,
    title: "Quinoa bowl",
    category: "Vegetariánske",
    difficulty: "Ľahké",
    time: "25 min",
    servings: 2,
    calories: 350,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    description: "Výživná misa s quinoou a zeleninou",
  },
];

const Cooking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Všetko");

  const filteredRecipes = sampleRecipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
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
            10 000+ receptov
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
            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={recipe.imageUrl}
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
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <CardTitle>10 000+ Receptov</CardTitle>
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
