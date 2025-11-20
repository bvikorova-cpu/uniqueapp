import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const HorseLeaderboard = () => {
  const { data: topHorses = [], isLoading } = useQuery({
    queryKey: ["horse-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horses")
        .select(`
          id,
          name,
          breed,
          color,
          speed_stat,
          stamina_stat,
          race_wins,
          total_races,
          user_id
        `)
        .order("race_wins", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getMedalEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Horses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Horses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topHorses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No horses have raced yet
          </p>
        ) : (
          <div className="space-y-3">
            {topHorses.map((horse, index) => {
              const medal = getMedalEmoji(index);
              const winRate = horse.total_races > 0 
                ? Math.round((horse.race_wins / horse.total_races) * 100) 
                : 0;

              return (
                <div
                  key={horse.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${index < 3 ? "bg-primary/5 border-2 border-primary/20" : "bg-muted/50"}
                  `}
                >
                  <div className="w-8 text-center font-bold text-lg">
                    {medal || `#${index + 1}`}
                  </div>

                  <Avatar 
                    className="h-12 w-12 border-2" 
                    style={{ borderColor: horse.color }}
                  >
                    <AvatarFallback style={{ backgroundColor: horse.color }}>
                      🐴
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{horse.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{horse.breed}</span>
                      <span>•</span>
                      <span>{horse.race_wins} wins</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-sm">{horse.race_wins}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {winRate}% win rate
                    </Badge>
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
