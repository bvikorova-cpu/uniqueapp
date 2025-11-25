import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, TrendingUp, Users } from "lucide-react";
import { getTopGameOfDay } from "@/data/pokigames";
import { useState } from "react";
import { PokiGameWrapper } from "@/components/games/PokiGameWrapper";

export const TopGameWidget = () => {
  const [showGame, setShowGame] = useState(false);
  const topGame = getTopGameOfDay();

  if (showGame) {
    return (
      <PokiGameWrapper
        slug={topGame.slug}
        title={topGame.title}
        onBack={() => setShowGame(false)}
      />
    );
  }

  return (
    <Card className="glassmorphism hover:shadow-glow transition-all duration-300 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
          Top Game of the Day
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {/* Game Preview */}
        <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Gamepad2 className="h-20 w-20 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white text-lg">{topGame.title}</h3>
          </div>
        </div>

        {/* Game Info */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {topGame.description}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{topGame.plays ? `${(topGame.plays / 1000000).toFixed(1)}M plays` : "New"}</span>
            </div>
            {topGame.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{topGame.rating}/10</span>
              </div>
            )}
          </div>
        </div>

        {/* Play Button */}
        <Button 
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          onClick={() => setShowGame(true)}
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Play Now
        </Button>
      </CardContent>
    </Card>
  );
};
