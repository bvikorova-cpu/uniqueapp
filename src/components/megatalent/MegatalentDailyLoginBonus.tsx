import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check } from "lucide-react";
import { toast } from "sonner";

const REWARDS = [
  { day: 1, label: "+10 XP" },
  { day: 2, label: "+20 XP" },
  { day: 3, label: "+50 XP" },
  { day: 4, label: "+75 XP" },
  { day: 5, label: "+100 XP" },
  { day: 6, label: "Boost" },
  { day: 7, label: "+500 XP 🎁" },
];

export default function MegatalentDailyLoginBonus({ userId }: { userId: string | null }) {
  const key = userId ? `mt_login_${userId}` : null;
  const [streak, setStreak] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    if (!key) return;
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (raw.last === today) {
        setStreak(raw.streak || 1);
        setClaimedToday(true);
      } else if (raw.last === yesterday) {
        setStreak(raw.streak || 0);
        setClaimedToday(false);
      } else {
        setStreak(0);
        setClaimedToday(false);
      }
    } catch {}
  }, [key]);

  if (!userId || !key) return null;

  const claim = () => {
    const today = new Date().toISOString().slice(0, 10);
    const nextStreak = (streak + 1) > 7 ? 1 : streak + 1;
    const reward = REWARDS[Math.min(nextStreak - 1, 6)];
    localStorage.setItem(key, JSON.stringify({ last: today, streak: nextStreak }));
    setStreak(nextStreak);
    setClaimedToday(true);
    toast.success(`Day ${nextStreak} reward: ${reward.label}`);
  };

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-5 w-5 text-amber-500" />
          Daily Login Bonus
          <Badge variant="secondary" className="ml-auto text-[10px]">Day {streak}/7</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5">
          {REWARDS.map((r, i) => {
            const done = i < streak;
            const isNext = i === streak && !claimedToday;
            return (
              <motion.div
                key={r.day}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border ${
                  done
                    ? "bg-amber-500/30 border-amber-500/60 text-amber-100"
                    : isNext
                    ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40"
                    : "bg-muted/20 border-border/30 text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : r.day}
                <span className="text-[8px] mt-0.5">{r.label.replace(" XP", "").replace("+", "")}</span>
              </motion.div>
            );
          })}
        </div>
        <Button
          onClick={claim}
          disabled={claimedToday}
          className="w-full"
          variant={claimedToday ? "outline" : "default"}
        >
          {claimedToday ? "Claimed today ✓ Come back tomorrow" : `Claim Day ${streak + 1}`}
        </Button>
      </CardContent>
    </Card>
  );
}
