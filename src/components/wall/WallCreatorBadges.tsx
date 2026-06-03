import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const rarityColors: Record<string, string> = {
  Common: "text-gray-500 bg-gray-500/10",
  Uncommon: "text-green-500 bg-green-500/10",
  Rare: "text-blue-500 bg-blue-500/10",
  Epic: "text-purple-500 bg-purple-500/10",
  Legendary: "text-amber-500 bg-amber-500/10",
};

function rarityFromPoints(points: number | null | undefined): keyof typeof rarityColors {
  const p = points ?? 0;
  if (p >= 3000) return "Legendary";
  if (p >= 1000) return "Epic";
  if (p >= 300) return "Rare";
  if (p >= 100) return "Uncommon";
  return "Common";
}

interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number | null;
}

export default function WallCreatorBadges() {
  const { user } = useAuth();

  const { data: allBadges = [] } = useQuery<BadgeRow[]>({
    queryKey: ["badges-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("id,name,description,icon,points_reward")
        .order("points_reward", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BadgeRow[];
    },
  });

  const { data: unlockedIds = new Set<string>() } = useQuery<Set<string>>({
    queryKey: ["user-badges-set", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.badge_id as string));
    },
  });

  const unlockedCount = allBadges.filter((b) => unlockedIds.has(b.id)).length;
  const total = allBadges.length;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-teal-500/10 border-orange-400/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-6 w-6 text-orange-500" />
          <div>
            <h3 className="font-bold">Creator Badges</h3>
            <p className="text-xs text-muted-foreground">{unlockedCount}/{total} unlocked</p>
          </div>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
            style={{ width: total ? `${(unlockedCount / total) * 100}%` : "0%" }}
          />
        </div>
      </Card>

      {total === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground bg-card/80 backdrop-blur-md border-border/30">
          No badges available yet.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map((badge, i) => {
            const unlocked = unlockedIds.has(badge.id);
            const rarity = rarityFromPoints(badge.points_reward);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`p-4 text-center border-border/30 backdrop-blur-md ${unlocked ? "bg-card/80" : "bg-muted/20 opacity-60"}`}>
                  <div className="relative inline-block mb-2">
                    <span className="text-3xl">{badge.icon || "🏆"}</span>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-xs">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
                  <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${rarityColors[rarity]}`}>{rarity}</span>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
