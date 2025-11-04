import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Recipe {
  id: number;
  name: string;
  emoji: string;
  ingredients: string[];
  timeLimit: number;
  difficulty: string;
  points: number;
}

const recipes: Recipe[] = [
  {
    id: 1,
    name: "Pancakes",
    emoji: "🥞",
    ingredients: ["Flour", "Eggs", "Milk", "Butter"],
    timeLimit: 60,
    difficulty: "Easy",
    points: 100
  },
  {
    id: 2,
    name: "Pizza",
    emoji: "🍕",
    ingredients: ["Dough", "Tomato Sauce", "Cheese", "Toppings"],
    timeLimit: 90,
    difficulty: "Medium",
    points: 150
  },
  {
    id: 3,
    name: "Sushi Rolls",
    emoji: "🍣",
    ingredients: ["Rice", "Nori", "Fish", "Vegetables"],
    timeLimit: 120,
    difficulty: "Hard",
    points: 200
  },
  {
    id: 4,
    name: "Burger",
    emoji: "🍔",
    ingredients: ["Bun", "Patty", "Lettuce", "Tomato", "Cheese"],
    timeLimit: 75,
    difficulty: "Medium",
    points: 150
  }
];

const MasterChefJunior = () => {
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [completedDishes, setCompletedDishes] = useState(0);

  useEffect(() => {
    if (isCompeting && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isCompeting && timeLeft === 0) {
      finishCooking();
    }
  }, [isCompeting, timeLeft]);

  const startCompetition = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsCompeting(true);
    setTimeLeft(recipe.timeLimit);
    toast.success(`Start cooking ${recipe.name}! 👨‍🍳`);
  };

  const finishCooking = () => {
    if (!selectedRecipe) return;

    const timeBonus = timeLeft > 0 ? Math.floor(timeLeft / 10) * 10 : 0;
    const totalPoints = selectedRecipe.points + timeBonus;
    
    setScore(score + totalPoints);
    setCompletedDishes(completedDishes + 1);
    setIsCompeting(false);
    
    toast.success(`Dish completed! +${totalPoints} points! 🌟`);
  };

  const progressPercentage = selectedRecipe 
    ? ((selectedRecipe.timeLimit - timeLeft) / selectedRecipe.timeLimit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/kids-channel')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-red-700 mb-2">
            👨‍🍳 MasterChef Junior Arena 🍳
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Cook delicious dishes against the clock!
          </p>

          <div className="flex justify-center gap-4">
            <Badge className="bg-red-500 text-white text-xl px-6 py-3">
              <Star className="w-5 h-5 mr-2 inline" />
              {score} Points
            </Badge>
            <Badge className="bg-orange-500 text-white text-xl px-6 py-3">
              <Trophy className="w-5 h-5 mr-2 inline" />
              {completedDishes} Dishes
            </Badge>
          </div>
        </div>

        {isCompeting && selectedRecipe ? (
          <Card className="border-4 border-red-400 shadow-2xl mb-8">
            <CardHeader>
              <div className="text-center">
                <div className="text-8xl mb-4">{selectedRecipe.emoji}</div>
                <CardTitle className="text-3xl text-red-700">
                  Cooking: {selectedRecipe.name}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-8 h-8 text-red-600" />
                  <span className={`text-6xl font-bold ${
                    timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-800"
                  }`}>
                    {timeLeft}s
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-4" />
              </div>

              <Card className="bg-yellow-50 border-2 border-yellow-300">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-3 text-yellow-800">
                    Ingredients:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <Badge key={index} className="bg-yellow-500 text-white text-base py-2">
                        ✓ {ingredient}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={finishCooking}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-8 text-2xl"
              >
                Finish Cooking! 🍽️
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="border-4 border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-red-50"
              >
                <CardHeader>
                  <div className="text-center text-7xl mb-4">{recipe.emoji}</div>
                  <CardTitle className="text-2xl text-center text-red-700">
                    {recipe.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge className={
                      recipe.difficulty === "Easy" ? "bg-green-500" :
                      recipe.difficulty === "Medium" ? "bg-yellow-500" :
                      "bg-red-500"
                    }>
                      {recipe.difficulty}
                    </Badge>
                    <Badge className="bg-orange-500">
                      <Clock className="w-4 h-4 mr-1 inline" />
                      {recipe.timeLimit}s
                    </Badge>
                    <Badge className="bg-yellow-500">
                      <Star className="w-4 h-4 mr-1 inline" />
                      {recipe.points} pts
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Ingredients:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-xs bg-white px-2 py-1 rounded border">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => startCompetition(recipe)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg"
                  >
                    Start Cooking! 🔥
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterChefJunior;
