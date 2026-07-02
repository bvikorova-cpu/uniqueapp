import { useAllBadges, useUserBadges } from "@/hooks/useGamification";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";


export default function AchievementProgressCards({ userId }: { userId: string }) {
  const { data: allBadges = [] } = useAllBadges();
  const { data: userBadges = [] } = useUserBadges(userId);
  const { data: stats } = useQuery({
    queryKey: ["badge-progress-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pts } = await supabase
        .from("user_points")
        .select("total_points, login_streak, level")
        .eq("user_id", userId)
        .maybeSingle();
      const { count: badgeCount } = await supabase
        .from("user_badges" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return {
        total_xp: pts?.total_points || 0,
        login_streak: pts?.login_streak || 0,
        level: pts?.level || 1,
        badges_earned: badgeCount || 0,
      };
    },
  });

  const computeProgress = (b: any): number => {
    if (!stats || !b.requirement_value) return 0;
    const type = String(b.requirement_type || "").toLowerCase();
    let current = 0;
    if (type.includes("xp") || type.includes("point")) current = stats.total_xp;
    else if (type.includes("streak") || type.includes("login")) current = stats.login_streak;
    else if (type.includes("level")) current = stats.level;
    else if (type.includes("badge")) current = stats.badges_earned;
    return Math.min(100, Math.round((current / b.requirement_value) * 100));
  };

  const earnedIds = new Set(userBadges.map((ub: any) => ub.badge_id));

  // Show only locked badges, sorted by requirement_value (closest first)
  const lockedBadges = allBadges
    .filter((b: any) => !earnedIds.has(b.id))
    .sort((a: any, b: any) => a.requirement_value - b.requirement_value)
    .slice(0, 6);

  if (lockedBadges.length === 0) return null;

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-primary" />
          {"Next Badges to Unlock"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lockedBadges.map((badge: any, i: number) => {
            const progressPct = computeProgress(badge);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="relative text-2xl shrink-0">
                  <span className="opacity-40">{badge.icon}</span>
                  <Lock className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <p className="text-sm font-medium truncate">{badge.name}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                      {`+${badge.points_reward} XP`}
                    </Badge>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-[10px] text-muted-foreground truncate cursor-help">
                        {`${badge.requirement_value} ${badge.requirement_type} required`}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{badge.description}</TooltipContent>
                  </Tooltip>
                  <Progress value={progressPct} className="h-1 mt-1.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
