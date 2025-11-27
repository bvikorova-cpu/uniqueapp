import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

export function F1Leaderboard() {
  const { data: cars, isLoading } = useQuery({
    queryKey: ["f1-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("f1_cars")
        .select("id, name, team, color, engine_stat, aero_stat, total_wins, total_races, user_id")
        .order("total_wins", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const getMedalEmoji = (index: number): string | null => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-white">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No cars have raced yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Top F1 Cars
      </h2>
      
      {cars.map((car, index) => {
        const medal = getMedalEmoji(index);
        const winRate = car.total_races > 0 
          ? Math.round((car.total_wins / car.total_races) * 100) 
          : 0;
          
        return (
          <div
            key={car.id}
            className={`flex items-center gap-4 p-4 rounded-lg border ${
              index < 3 
                ? "bg-gradient-to-r from-red-900/50 to-black border-red-500" 
                : "bg-black/50 border-gray-700"
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-lg font-bold text-white">
              {medal || index + 1}
            </div>
            
            <div
              className="w-12 h-12 rounded-lg border-4"
              style={{ 
                backgroundColor: car.color,
                borderColor: index < 3 ? '#ef4444' : '#374151'
              }}
            />
            
            <div className="flex-1">
              <p className="font-bold text-white">{car.name}</p>
              <p className="text-sm text-gray-400">{car.team}</p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-yellow-500">{car.total_wins} Wins</p>
              <p className="text-sm text-gray-400">{winRate}% win rate</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
