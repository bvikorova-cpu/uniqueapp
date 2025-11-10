import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Swords } from "lucide-react";

interface Character {
  id: string;
  name: string;
  image_url: string;
  battle_wins: number;
  battle_losses: number;
  battle_rating: number;
  category: string;
}

export const CharacterLeaderboard = () => {
  const { data: topCharacters = [], isLoading } = useQuery({
    queryKey: ["character-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("battle_rating", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Character[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Battle Champions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Battle Champions - Top 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCharacters.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No battles yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3">
            {topCharacters.map((character, index) => {
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
              const winRate = character.battle_wins + character.battle_losses > 0
                ? Math.round((character.battle_wins / (character.battle_wins + character.battle_losses)) * 100)
                : 0;

              return (
                <div
                  key={character.id}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg transition-all
                    ${index < 3 
                      ? "bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/50" 
                      : "bg-muted/30 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="w-10 text-center font-bold text-2xl">
                    {medal || `#${index + 1}`}
                  </div>

                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={character.image_url} alt={character.name} />
                    <AvatarFallback>{character.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-white truncate">
                      {character.name}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {character.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Win Rate: {winRate}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-white text-lg">
                        {character.battle_rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-green-500">
                        {character.battle_wins}W
                      </span>
                      <Swords className="h-3 w-3" />
                      <span className="text-red-500">
                        {character.battle_losses}L
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
