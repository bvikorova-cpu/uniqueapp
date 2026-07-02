import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

  const getRankStyle = (index: number) => {
    if (index === 0) return { border: "border-amber-400/60", bg: "from-amber-950/40 to-amber-900/20", glow: "shadow-amber-500/20", badge: "🥇", color: "text-amber-300" };
    if (index === 1) return { border: "border-gray-300/40", bg: "from-gray-800/40 to-gray-900/20", glow: "shadow-gray-400/10", badge: "🥈", color: "text-gray-300" };
    if (index === 2) return { border: "border-orange-400/40", bg: "from-orange-950/30 to-orange-900/10", glow: "shadow-orange-500/10", badge: "🥉", color: "text-orange-300" };
    return { border: "border-cyan-500/15", bg: "from-slate-900/50 to-slate-950/50", glow: "", badge: null, color: "text-cyan-300" };
  };

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"F1 Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the F1 Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in F1 Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-cyan-400/60 font-mono text-sm uppercase tracking-wider">
          <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
          Loading Rankings...
        </div>
      </div>
    </>
  );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="p-12 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-cyan-500/30" />
        <p className="text-cyan-400/50 font-mono uppercase tracking-wider text-sm">No drivers have raced yet</p>
        <p className="text-cyan-400/30 text-xs mt-2">Be the first to claim the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Trophy className="h-6 w-6 text-amber-400" />
          <div className="absolute -inset-2 bg-amber-400/10 rounded-full blur-md" />
        </div>
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Driver Rankings</h2>
          <p className="text-[10px] text-cyan-400/50 font-mono uppercase tracking-[0.3em]">Top 10 Drivers</p>
        </div>
      </div>

      {/* Rankings */}
      <div className="space-y-2">
        {cars.map((car, index) => {
          const rank = getRankStyle(index);
          const winRate = car.total_races > 0 
            ? Math.round((car.total_wins / car.total_races) * 100) 
            : 0;
            
          return (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-gradient-to-r ${rank.bg} ${rank.border} ${rank.glow} shadow-lg backdrop-blur-sm overflow-hidden group hover:border-cyan-400/40 transition-all duration-300`}
            >
              {/* Hover scan effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Rank */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-black/40 border ${rank.border} font-mono font-bold text-lg ${rank.color} shrink-0`}>
                {rank.badge || (index + 1)}
              </div>
              
              {/* Car color */}
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/20"
                  style={{ backgroundColor: car.color }}
                />
                <div 
                  className="absolute -inset-1 rounded-xl blur-md opacity-40"
                  style={{ backgroundColor: car.color }}
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-white text-sm sm:text-base truncate">{car.name}</p>
                <p className="text-xs text-cyan-400/50 font-mono truncate">{car.team}</p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-xs text-cyan-400/40 font-mono">
                    <Shield className="h-3 w-3" />
                    <span>PWR {car.engine_stat + car.aero_stat}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-amber-400 text-sm">{car.total_wins} W</p>
                  <p className="text-[10px] text-cyan-400/40 font-mono">{winRate}% WR</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
