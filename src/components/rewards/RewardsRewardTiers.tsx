import { motion } from "framer-motion";
import { Crown, Star, Shield, Gem, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRewardsStats } from "@/hooks/useRewardsStats";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const tiers = [
  { id: "bronze", name: "Bronze", emoji: "🥉", minXP: 0, maxXP: 500, color: "from-amber-700 to-orange-800", perks: ["Daily reward +10%", "Basic badge display"], icon: Shield },
  { id: "silver", name: "Silver", emoji: "🥈", minXP: 500, maxXP: 2000, color: "from-gray-300 to-gray-500", perks: ["Daily reward +25%", "Silver profile frame", "Weekly bonus challenges"], icon: Star },
  { id: "gold", name: "Gold", emoji: "🥇", minXP: 2000, maxXP: 5000, color: "from-amber-400 to-yellow-500", perks: ["Daily reward +50%", "Gold profile frame", "Priority challenge access", "1 free AI tool/week"], icon: Crown },
  { id: "platinum", name: "Platinum", emoji: "💎", minXP: 5000, maxXP: 15000, color: "from-cyan-400 to-blue-500", perks: ["Daily reward +100%", "Platinum animated frame", "Exclusive challenges", "3 free AI tools/week", "Leaderboard highlight"], icon: Gem },
  { id: "diamond", name: "Diamond", emoji: "👑", minXP: 15000, maxXP: 999999, color: "from-purple-400 to-pink-500", perks: ["Daily reward +200%", "Diamond legendary frame", "All challenges unlocked", "Unlimited AI tools", "VIP badge", "Exclusive Diamond events"], icon: Crown },
];

export default function RewardsRewardTiers() {
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);
  const { data: stats, isLoading } = useRewardsStats(userId);

  if (isLoading || !stats) {
    return (
      <Card className="p-8 text-center bg-card/80 border-amber-400/15">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
      </Card>
    );
  }

  const currentXP = stats.totalXP;
  const currentTierIdx = Math.max(0, tiers.findIndex(t => currentXP >= t.minXP && currentXP < t.maxXP));

  return (
    <div className="space-y-3">
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-400/20 backdrop-blur-md">
        <h3 className="font-bold flex items-center gap-2 mb-1"><Crown className="h-5 w-5 text-amber-500" /> Your Tier</h3>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tiers[currentTierIdx]?.emoji || "🥉"}</span>
          <div className="flex-1">
            <p className="font-black text-lg">{tiers[currentTierIdx]?.name || "Bronze"}</p>
            <Progress value={((currentXP - (tiers[currentTierIdx]?.minXP || 0)) / ((tiers[currentTierIdx]?.maxXP || 500) - (tiers[currentTierIdx]?.minXP || 0))) * 100} className="h-2 mt-1" />
            <p className="text-[10px] text-muted-foreground mt-0.5">{currentXP.toLocaleString()} / {tiers[currentTierIdx]?.maxXP.toLocaleString()} XP to next tier</p>
          </div>
        </div>
      </Card>

      {tiers.map((tier, i) => {
        const isUnlocked = currentXP >= tier.minXP;
        const isCurrent = i === currentTierIdx;
        return (
          <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`p-4 border backdrop-blur-md ${isCurrent ? "border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/10" : isUnlocked ? "border-border/30 bg-card/80" : "border-border/10 bg-muted/20 opacity-60"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                  {isUnlocked ? <tier.icon className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-white/60" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tier.emoji}</span>
                    <p className="font-bold">{tier.name}</p>
                    {isCurrent && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">CURRENT</span>}
                    {isUnlocked && !isCurrent && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tier.minXP.toLocaleString()} XP required</p>
                </div>
              </div>
              <div className="ml-13 space-y-1">
                {tier.perks.map((perk, j) => (
                  <p key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="text-amber-500">✦</span> {perk}
                  </p>
                ))}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
