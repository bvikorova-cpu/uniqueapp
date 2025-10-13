import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Trophy, Star, Heart, Zap, Brain, Dribbble, MapPin, Car } from "lucide-react";
import { GameDistributionWrapper } from "@/components/games/GameDistributionWrapper";
import { gdGames, getGamesByCategory, gameCategories, type GameCategory } from "@/data/gdgames";

const Games = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // If a specific game is active, show it
  if (activeGame) {
    const game = gdGames.find(g => g.id === activeGame);
    if (game) {
      return (
        <GameDistributionWrapper 
          gameId={game.gameId}
          title={game.title}
          width={game.width}
          height={game.height}
          onBack={() => setActiveGame(null)}
        />
      );
    }
  }

  const getCategoryIcon = (category: GameCategory) => {
    switch(category) {
      case "girls": return Heart;
      case "action": return Zap;
      case "puzzle": return Brain;
      case "sports": return Dribbble;
      case "adventure": return MapPin;
      case "racing": return Car;
      default: return Gamepad2;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Online Games
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a category and your favorite game!
          </p>
        </div>

        <Tabs defaultValue="girls" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {(Object.keys(gameCategories) as GameCategory[]).map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{gameCategories[category]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(gameCategories) as GameCategory[]).map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getGamesByCategory(category).map((game) => (
                  <Card 
                    key={game.id}
                    className="hover:shadow-elegant transition-all cursor-pointer group" 
                    onClick={() => setActiveGame(game.id)}
                  >
                    <CardHeader>
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Gamepad2 className="h-20 w-20 text-primary/40" />
                      </div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {game.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">
                            {game.rating ? `${game.rating}/10` : "New"}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full" variant="default">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Games;
