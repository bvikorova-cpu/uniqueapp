import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Zap, Crown, Rocket, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const REWARD_PER_REFERRAL = 5;

interface Milestone {
  count: number;
  title: string;
  icon: any;
  color: string;
}

const MILESTONES: Milestone[] = [
  { count: 5, title: "Spark", icon: Flame, color: "from-orange-500 to-red-500" },
  { count: 10, title: "Rising Star", icon: Star, color: "from-yellow-500 to-orange-500" },
  { count: 25, title: "Influencer", icon: Zap, color: "from-violet-500 to-fuchsia-500" },
  { count: 50, title: "Ambassador", icon: Crown, color: "from-amber-400 to-yellow-600" },
  { count: 100, title: "Legend", icon: Rocket, color: "from-emerald-500 to-cyan-500" },
];

interface Props {
  totalReferrals: number;
}

export const ReferralMilestones = ({ totalReferrals }: Props) => {
  const next = MILESTONES.find((m) => m.count > totalReferrals);
  const lastReached = [...MILESTONES].reverse().find((m) => m.count <= totalReferrals);
  const progressPct = next ? (totalReferrals / next.count) * 100 : 100;
  const earned = totalReferrals * REWARD_PER_REFERRAL;

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 backdrop-blur-xl">
      <FloatingHowItWorks
        title={"Referral Milestones"}
        intro={"Progress badges based on your real approved referrals."}
        steps={[
          { title: "Invite friends", desc: "Share your referral code." },
          { title: "Earn €5 each", desc: "Every paid Megatalent referral credits a flat €5." },
          { title: "Unlock badges", desc: "Badges are recognition only — no extra cash bonuses." },
          { title: "Withdraw", desc: "Request a payout of your real earned balance." },
        ]}
      />

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-yellow-500" />
            Referral Badges
          </span>
          {lastReached && (
            <Badge className={`bg-gradient-to-r ${lastReached.color} text-white border-0`}>
              {lastReached.title}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="text-center">
          <div className="text-3xl font-black text-yellow-500">€{earned.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            earned from {totalReferrals} approved {totalReferrals === 1 ? "referral" : "referrals"} × €
            {REWARD_PER_REFERRAL}
          </p>
        </div>

        {next ? (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-semibold">
                Next badge: <span className="text-yellow-500">{next.title}</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {totalReferrals} / {next.count}
              </span>
            </div>
            <Progress value={progressPct} className="h-2.5" />
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-yellow-500 font-bold">{next.count - totalReferrals}</span> more
              referrals → <span className="font-semibold text-foreground">€{(next.count * REWARD_PER_REFERRAL).toFixed(2)}</span> total earned
            </p>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-base font-bold text-emerald-400">🎉 ALL BADGES UNLOCKED!</p>
          </div>
        )}

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
                title={`${m.title} — ${m.count} referrals`}
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
          Badges are recognition only — the only payout is the flat €5 per paid referral.
        </div>
      </CardContent>
    </Card>
  );
};
