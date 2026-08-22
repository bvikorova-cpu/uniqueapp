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

  const earnedIds = new Set(userBadges.map((ub: any) => ub.badge_id));

  // Show only locked badges, sorted by requirement_value (closest first)
  const lockedBadges = allBadges
    .filter((b: any) => !earnedIds.has(b.id))
    .sort((a: any, b: any) => a.requirement_value - b.requirement_value)
    .slice(0, 6);

  const metrics = Array.from(
    new Set(lockedBadges.map((b: any) => String(b.requirement_type || "").toLowerCase()).filter(Boolean))
  );

  // Real per-metric values straight from the database (posts, friends, streak, xp, ...)
  const { data: metricValues = {} } = useQuery({
    queryKey: ["badge-metric-values", userId, metrics.join(",")],
    enabled: !!userId && metrics.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        metrics.map(async (m) => {
          const { data } = await (supabase as any).rpc("badge_metric_value", { _user_id: userId, _metric: m });
          return [m, Number(data ?? 0)] as const;
        })
      );
      return Object.fromEntries(entries) as Record<string, number>;
    } });

  const computeProgress = (b: any): number => {
    if (!b.requirement_value) return 0;
    const type = String(b.requirement_type || "").toLowerCase();
    const current = metricValues[type] ?? 0;
    return Math.min(100, Math.round((current / b.requirement_value) * 100));
  };

  if (lockedBadges.length === 0) return null;

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base justify-between">
          <span className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> {"Next Badges to Unlock"}</span>
          <HowItWorksButton title="Next Badges" intro="Shows the badges you are closest to earning." steps={[
            { title: "Ranked by progress", desc: "Cards are sorted so the badge you're closest to unlocking appears first." },
            { title: "Progress bar", desc: "The bar fills as you take related actions (games played, friends added, etc.)." },
            { title: "Locked details", desc: "Hover the lock icon to see the exact requirement in a tooltip." },
            { title: "Auto-unlocks", desc: "When you hit 100% the badge is granted automatically and appears in your profile." },
          ]} />
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
