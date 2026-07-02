import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDailyLoginReward } from "@/hooks/useDailyLoginReward";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const REWARDS = [
  { day: 1, label: "+1" },
  { day: 2, label: "+1" },
  { day: 3, label: "+1" },
  { day: 4, label: "+1" },
  { day: 5, label: "+1" },
  { day: 6, label: "+1" },
  { day: 7, label: "+2 🎁" },
];

export default function MegatalentDailyLoginBonus({ userId }: { userId: string | null }) {
  const { streak, loading, claiming, canClaim, claim } = useDailyLoginReward();

  if (!userId) return null;

  const current = streak?.current_streak ?? 0;
  const displayDay = Math.min(current % 7 || (current ? 7 : 0), 7);

  const onClaim = async () => {
    const res = await claim();
    if (res?.claimed) {
      toast.success(`+${res.bonus ?? 1} credit${(res.bonus ?? 1) === 1 ? "" : "s"} · streak ${res.streak} 🔥`);
    } else if (res) {
      toast.info("Already claimed today");
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Daily Login Bonus - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Daily Login Bonus section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Daily Login Bonus.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-5 w-5 text-amber-500" />
          Daily Login Bonus
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Day {displayDay}/7 · Streak {current}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5">
              {REWARDS.map((r, i) => {
                const done = i < displayDay;
                const isNext = i === displayDay && canClaim;
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
                    <span className="text-[8px] mt-0.5">{r.label}</span>
                  </motion.div>
                );
              })}
            </div>
            <Button onClick={onClaim} disabled={!canClaim || claiming} className="w-full" variant={canClaim ? "default" : "outline"}>
              {claiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {canClaim ? `Claim Day ${displayDay + 1 > 7 ? 1 : displayDay + 1}` : "Come back tomorrow"}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Longest streak: {streak?.longest_streak ?? 0} · Total claims: {streak?.total_claims ?? 0}
            </p>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
}
