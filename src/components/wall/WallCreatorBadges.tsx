import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Lock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

const metricLabels: Record<string, string> = {
  posts: "posts",
  comments: "comments",
  likes_received: "likes received",
  reactions: "reactions given",
  shares: "shares",
  stories: "stories",
  messages: "messages sent",
  followers: "followers",
  profile_visits: "profile visits",
  friends: "friends",
  videos: "videos",
  photos: "photos",
  login_streak: "day streak",
  xp: "XP",
  level: "level",
  achievements: "achievements",
  challenges: "challenges completed",
};

interface BadgeProgressRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number | null;
  requirement_type: string;
  requirement_value: number | null;
  current_value: number;
  unlocked: boolean;
  earned_at: string | null;
}

export default function WallCreatorBadges() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: badges = [], isLoading, refetch } = useQuery<BadgeProgressRow[]>({
    queryKey: ["badge-progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_badge_progress" as any);
      if (error) throw error;
      return (data ?? []) as unknown as BadgeProgressRow[];
    },
  });

  // Auto-sync newly earned badges when the tab opens.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("sync_my_badges" as any);
      if (cancelled) return;
      if (typeof data === "number" && data > 0) {
        toast({ title: `🏆 ${data} new badge${data > 1 ? "s" : ""} unlocked!` });
      }
      qc.invalidateQueries({ queryKey: ["badge-progress", user.id] });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, qc]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const total = badges.length;

  const sync = async () => {
    const { data, error } = await supabase.rpc("sync_my_badges" as any);
    if (error) {
      toast({ title: "Could not refresh badges", variant: "destructive" });
      return;
    }
    toast({
      title:
        typeof data === "number" && data > 0
          ? `🏆 ${data} new badge${data > 1 ? "s" : ""} unlocked!`
          : "Badges up to date",
    });
    refetch();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-teal-500/10 border-orange-400/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-6 w-6 text-orange-500" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold">Creator Badges</h3>
            <p className="text-xs text-muted-foreground">{unlockedCount}/{total} unlocked</p>
          </div>
          <Button size="sm" variant="outline" onClick={sync} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
            style={{ width: total ? `${(unlockedCount / total) * 100}%` : "0%" }}
          />
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6 text-center text-sm text-muted-foreground bg-card/80 backdrop-blur-md border-border/30">
          Loading badges…
        </Card>
      ) : total === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground bg-card/80 backdrop-blur-md border-border/30">
          {user ? "No badges available yet." : "Sign in to track your badges."}
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge, i) => {
            const unlocked = badge.unlocked;
            const rarity = rarityFromPoints(badge.points_reward);
            const target = badge.requirement_value ?? 0;
            const current = Math.min(badge.current_value ?? 0, target || Infinity);
            const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
              >
                <Card
                  className={`p-4 text-center border-border/30 backdrop-blur-md h-full ${
                    unlocked ? "bg-card/80" : "bg-muted/20"
                  }`}
                >
                  <div className="relative inline-block mb-2">
                    <span className={`text-3xl ${unlocked ? "" : "opacity-40 grayscale"}`}>
                      {badge.icon || "🏆"}
                    </span>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-xs">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{badge.description}</p>
                  <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${rarityColors[rarity]}`}>
                    {rarity}
                  </span>

                  {!unlocked && target > 0 && (
                    <div className="mt-2 space-y-1">
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-[9px] text-muted-foreground">
                        {current}/{target} {metricLabels[badge.requirement_type] ?? badge.requirement_type}
                      </p>
                    </div>
                  )}
                  {unlocked && badge.earned_at && (
                    <p className="mt-2 text-[9px] text-emerald-500 font-semibold">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
