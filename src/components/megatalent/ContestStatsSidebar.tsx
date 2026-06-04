import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, TrendingUp, Flame, Award, Star } from "lucide-react";
import { useMegatalentContestStats } from "@/hooks/useMegatalentContestStats";

interface ContestStatsSidebarProps {
  subscriptionTier: "premium" | "top_premium" | null;
  totalVotes: number;
}

export default function ContestStatsSidebar({ subscriptionTier, totalVotes }: ContestStatsSidebarProps) {
  const { data: stats } = useMegatalentContestStats();
  const prizeLabel = stats?.prizePool ? stats.prizePoolFormatted : "TBA";
  return (
    <div className="space-y-4">
      {/* Contest Prize Card */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 pointer-events-none" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Monthly Contest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent"
            >
              €10,000
            </motion.div>
            <p className="text-xs text-muted-foreground mt-1">Grand Prize</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Month:</span>
              <span className="font-semibold text-xs">
                {(() => {
                  const now = new Date();
                  if (now < new Date("2026-01-01")) return "Starts 01.01.2026";
                  return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                })()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-semibold text-xs">
                {(() => {
                  const now = new Date();
                  if (now < new Date("2026-01-01")) {
                    const d = Math.ceil((new Date("2026-01-01").getTime() - now.getTime()) / 86400000);
                    return `Starts in ${d} days`;
                  }
                  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  const d = Math.ceil((last.getTime() - now.getTime()) / 86400000);
                  return `${d} ${d === 1 ? "day" : "days"}`;
                })()}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all"
                style={{
                  width: (() => {
                    const now = new Date();
                    if (now < new Date("2026-01-01")) return "0%";
                    const d = now.getDate();
                    const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    return `${(d / total) * 100}%`;
                  })(),
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner Showcase */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-amber-500" />
            Hall of Fame
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No winners yet</p>
            <p className="text-xs mt-1">Contest starts January 2026</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: Star, label: "Your Plan", value: subscriptionTier === "top_premium" ? "TOP Premium" : subscriptionTier === "premium" ? "Premium" : "Free", color: "text-yellow-500" },
            { icon: Flame, label: "Your Votes", value: totalVotes.toLocaleString(), color: "text-orange-500" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-bold">{stat.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
