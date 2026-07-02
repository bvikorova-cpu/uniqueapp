import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Zap, Crown, Rocket, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Milestone {
  count: number;
  title: string;
  reward: string;
  icon: any;
  color: string;
}

const MILESTONES: Milestone[] = [
  { count: 5, title: "Spark", reward: "+€10 bonus", icon: Flame, color: "from-orange-500 to-red-500" },
  { count: 10, title: "Rising Star", reward: "+€25 bonus", icon: Star, color: "from-yellow-500 to-orange-500" },
  { count: 25, title: "Influencer", reward: "+€75 bonus", icon: Zap, color: "from-violet-500 to-fuchsia-500" },
  { count: 50, title: "Ambassador", reward: "+€200 bonus", icon: Crown, color: "from-amber-400 to-yellow-600" },
  { count: 100, title: "Legend", reward: "+€500 + Lifetime Premium", icon: Rocket, color: "from-emerald-500 to-cyan-500" },
];

interface Props {
  totalReferrals: number;
}

export const ReferralMilestones = ({ totalReferrals }: Props) => {
  const next = MILESTONES.find((m) => m.count > totalReferrals);
  const lastReached = [...MILESTONES].reverse().find((m) => m.count <= totalReferrals);
  const progressPct = next
    ? (totalReferrals / next.count) * 100
    : 100;

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 backdrop-blur-xl">
      <FloatingHowItWorks
        title={"Referral Milestones"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-yellow-500" />
            Milestone Rewards
          </span>
          {lastReached && (
            <Badge className={`bg-gradient-to-r ${lastReached.color} text-white border-0`}>
              {lastReached.title}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress to next */}
        {next ? (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-semibold">
                Next: <span className="text-yellow-500">{next.title}</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {totalReferrals} / {next.count}
              </span>
            </div>
            <Progress value={progressPct} className="h-2.5" />
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-yellow-500 font-bold">{next.count - totalReferrals}</span> more to unlock{" "}
              <span className="font-semibold text-foreground">{next.reward}</span>
            </p>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-base font-bold text-emerald-400">🎉 ALL MILESTONES UNLOCKED!</p>
            <p className="text-xs text-muted-foreground mt-1">You're a true Legend</p>
          </div>
        )}

        {/* All milestones */}
        <div className="grid grid-cols-5 gap-1.5">
          {MILESTONES.map((m, i) => {
            const reached = totalReferrals >= m.count;
            const Icon = m.icon;
            return (
              <motion.div
                key={m.count}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 border transition-all ${
                  reached
                    ? `bg-gradient-to-br ${m.color} border-white/20 shadow-lg`
                    : "bg-background/40 border-border/40 opacity-50"
                }`}
                title={`${m.title} — ${m.reward}`}
              >
                {reached ? (
                  <Icon className="h-4 w-4 text-white drop-shadow" />
                ) : (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={`text-[9px] font-bold mt-0.5 ${reached ? "text-white" : "text-muted-foreground"}`}>
                  {m.count}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="text-[11px] text-muted-foreground text-center pt-1 border-t border-border/30">
          💎 Reach <span className="text-yellow-500 font-bold">100 invites</span> for{" "}
          <span className="font-bold text-foreground">Lifetime Premium</span>
        </div>
      </CardContent>
    </Card>
  );
};
