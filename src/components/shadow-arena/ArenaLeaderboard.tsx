import { motion } from "framer-motion";
import { Trophy, Crown, Ghost, Skull, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const tiers = [
  { min: 10, label: "Shadow Lord", icon: Crown, color: "text-yellow-400" },
  { min: 5, label: "Phantom", icon: Ghost, color: "text-purple-400" },
  { min: 1, label: "Specter", icon: Skull, color: "text-red-400" },
];

function getTier(wins: number) {
  return tiers.find(t => wins >= t.min) || tiers[tiers.length - 1];
}

interface LeaderRow {
  user_id: string;
  display_name: string;
  wins: number;
  matches: number;
  earnings_cents: number;
}

export function ArenaLeaderboard() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ["arena-leaderboard"],
    queryFn: async (): Promise<LeaderRow[]> => {
      const { data, error } = await supabase.rpc("get_arena_leaderboard", { limit_count: 20 });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        user_id: r.user_id,
        display_name: r.display_name,
        wins: Number(r.wins) || 0,
        matches: Number(r.matches) || 0,
        earnings_cents: Number(r.earnings_cents) || 0,
      }));
    },
    staleTime: 60_000,
  });

  return (
<div className="rounded-2xl border border-purple-900/30 bg-gradient-to-br from-purple-950/20 via-card/30 to-red-950/20 p-6 mb-8">
  <FloatingHowItWorks title="ArenaLeaderboard — How it works" steps={[{title:"Open this section",desc:"Access ArenaLeaderboard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" />
        Arena Leaderboard
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        </div>
      ) : leaders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No rankings yet — compete in battles to appear here!
        </p>
      ) : (
        <div className="space-y-2">
          {leaders.map((entry, i) => {
            const tier = getTier(entry.wins);
            const TierIcon = tier.icon;
            return (
              <motion.div
                key={entry.user_id}
                className="flex items-center gap-4 p-3 rounded-xl bg-card/20 border border-border/20 hover:border-purple-700/40 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className={`text-lg font-black w-8 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-purple-400" : i === 2 ? "text-red-400" : "text-muted-foreground"}`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{entry.display_name}</span>
                    <Badge variant="outline" className={`text-xs ${tier.color} border-current/30`}>
                      <TierIcon className="w-3 h-3 mr-1" />
                      {tier.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{entry.wins}W · {entry.matches}M</span>
                  <span className="font-bold text-yellow-400">€{(entry.earnings_cents / 100).toFixed(0)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
