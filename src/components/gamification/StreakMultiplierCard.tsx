import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Zap, Crown, Loader2 } from "lucide-react";
import { useDailyLoginReward } from "@/hooks/useDailyLoginReward";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Milestone {
  days: number;
  label: string;
  reward: string;
  icon: typeof Flame;
  color: string;
}

const MILESTONES: Milestone[] = [
  { days: 7, label: "Week Warrior", reward: "+5 credits", icon: Zap, color: "from-orange-400 to-amber-500" },
  { days: 30, label: "Monthly Master", reward: "+25 credits + badge", icon: Trophy, color: "from-purple-500 to-pink-500" },
  { days: 100, label: "Centurion", reward: "+100 credits + exclusive badge", icon: Crown, color: "from-yellow-400 via-orange-500 to-red-500" },
];

export function StreakMultiplierCard() {
  const { streak, loading, claiming, canClaim, claim } = useDailyLoginReward();
  const current = streak?.current_streak ?? 0;

  // find next milestone
  const next = MILESTONES.find((m) => current < m.days) ?? MILESTONES[MILESTONES.length - 1];
  const prev = [...MILESTONES].reverse().find((m) => current >= m.days);
  const base = prev?.days ?? 0;
  const progress = Math.min(100, ((current - base) / (next.days - base)) * 100);

  // current multiplier: 1x base, 1.5x at 7, 2x at 30, 3x at 100
  const multiplier = current >= 100 ? 3 : current >= 30 ? 2 : current >= 7 ? 1.5 : 1;

  const onClaim = async () => {
    const res = await claim();
    if (res?.claimed) {
      toast.success(`+${res.bonus} credit${(res.bonus ?? 1) === 1 ? "" : "s"}`, {
        description: `Streak: ${res.streak} days 🔥`,
      });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Streak Multiplier Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Streak Multiplier Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Streak Multiplier Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-card/80 to-amber-500/5 border-orange-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <motion.div
              animate={current > 0 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className={`h-5 w-5 ${current > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            </motion.div>
            Daily Streak
          </CardTitle>
          <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-500 font-bold">
            {multiplier}x bonus
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">
            {current}
          </span>
          <span className="text-sm text-muted-foreground">
            day{current === 1 ? "" : "s"} · record {streak?.longest_streak ?? 0}
          </span>
        </div>

        {/* progress to next milestone */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Next: {next.label}</span>
            <span className="font-semibold">{current}/{next.days}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${next.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Reward: {next.reward}</p>
        </div>

        {/* milestones */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {MILESTONES.map((m) => {
            const reached = current >= m.days;
            const Icon = m.icon;
            return (
              <div
                key={m.days}
                className={`relative p-2 rounded-lg border text-center transition-all ${
                  reached
                    ? "border-orange-500/50 bg-gradient-to-br " + m.color + " text-white"
                    : "border-border bg-muted/30 opacity-60"
                }`}
              >
                <Icon className="h-4 w-4 mx-auto mb-1" />
                <div className="text-[10px] font-bold">{m.days}d</div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={onClaim}
          disabled={!canClaim || claiming || loading}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
        >
          {claiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {canClaim ? "Claim today's reward" : "Come back tomorrow"}
        </Button>
      </CardContent>
    </Card>
    </>
  );
}

export default StreakMultiplierCard;
