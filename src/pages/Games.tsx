import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Trophy, Star, Heart, Zap, Brain, Dribbble, MapPin, Car, Sparkles, Target } from "lucide-react";
import { PokiGameWrapper } from "@/components/games/PokiGameWrapper";
import { pokiGames, getGamesByCategory, gameCategories, type GameCategory } from "@/data/pokigames";

const Games = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // If a specific game is active, show it
  if (activeGame) {
    const game = pokiGames.find(g => g.id === activeGame);
    if (game) {
      return (
        <PokiGameWrapper 
          slug={game.slug}
          title={game.title}
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
      case "strategy": return Target;
      case "casual": return Sparkles;
      default: return Gamepad2;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Poki Games
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg px-2">
            Play thousands of free online games - Powered by Poki
          </p>
        </div>

        <Tabs defaultValue="action" className="w-full">
          <div className="overflow-x-auto scrollbar-hide mb-8">
            <TabsList className="inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-4 lg:grid-cols-8 glassmorphism">
              {(Object.keys(gameCategories) as GameCategory[]).map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <TabsTrigger key={category} value={category} className="flex items-center gap-1.5 px-3 py-2 whitespace-nowrap">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{gameCategories[category]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {(Object.keys(gameCategories) as GameCategory[]).map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {getGamesByCategory(category).map((game) => (
                  <Card 
                    key={game.id}
                    className="glassmorphism hover:shadow-glow transition-all duration-300 cursor-pointer group animate-fade-in" 
                    onClick={() => setActiveGame(game.id)}
                  >
                    <CardHeader>
                      <div className="relative h-40 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-lg mb-4 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Gamepad2 className="h-20 w-20 text-primary/40" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {game.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
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
                        {game.plays && (
                          <span className="text-xs text-muted-foreground">
                            {(game.plays / 1000000).toFixed(1)}M plays
                          </span>
                        )}
                      </div>
                      <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Play Now
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
