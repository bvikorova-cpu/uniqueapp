import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Gift, Loader2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { triggerRewardConfetti } from "@/utils/confetti";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface StreakRow {
  current_streak: number;
  longest_streak: number;
  last_claim_date: string | null;
  total_credits_earned: number;
}

const MILESTONES = [
  { day: 1, reward: 1 },
  { day: 3, reward: 2 },
  { day: 7, reward: 3 },
  { day: 14, reward: 5 },
  { day: 30, reward: 10 },
];

function rewardFor(streak: number) {
  if (streak >= 30) return 10;
  if (streak >= 14) return 5;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export default function IQDailyStreak() {
  const [row, setRow] = useState<StreakRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = row?.last_claim_date === today;
  const nextReward = rewardFor((row?.current_streak ?? 0) + (claimedToday ? 0 : 1));

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("iq_daily_streaks")
        .select("current_streak,longest_streak,last_claim_date,total_credits_earned")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow((data as StreakRow) ?? { current_streak: 0, longest_streak: 0, last_claim_date: null, total_credits_earned: 0 });
      setLoading(false);
    })();
  }, []);

  const claim = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc("claim_iq_daily_streak");
      if (error) throw error;
      const res = data as { claimed: boolean; reason?: string; streak: number; reward?: number };
      if (!res.claimed) {
        toast({ title: "Already claimed", description: "Come back tomorrow to extend your streak!" });
      } else {
        triggerRewardConfetti();
        toast({ title: `🔥 Day ${res.streak} streak!`, description: `+${res.reward} IQ credits awarded` });
        setRow((prev) => ({
          current_streak: res.streak,
          longest_streak: Math.max(prev?.longest_streak ?? 0, res.streak),
          last_claim_date: today,
          total_credits_earned: (prev?.total_credits_earned ?? 0) + (res.reward ?? 0),
        }));
        qc.invalidateQueries({ queryKey: ["iq-credits"] });
      }
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to claim", variant: "destructive" });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How IQDaily Streak works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="bg-gradient-to-br from-orange-500/10 to-pink-500/5 border-orange-500/20">
        <CardContent className="p-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent>
      </Card>
      </>
      );
  }

  const streak = row?.current_streak ?? 0;

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-purple-500/10 border-orange-500/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Flame className="h-5 w-5 text-orange-500" />
            </motion.div>
            Daily IQ Streak
          </span>
          <Badge variant="outline" className="text-xs">
            <Trophy className="h-3 w-3 mr-1" /> Best: {row?.longest_streak ?? 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            {streak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {streak === 1 ? "day" : "days"} in a row
          </div>
        </div>

        <div className="flex justify-between gap-1">
          {MILESTONES.map((m) => {
            const reached = streak >= m.day;
            return (
              <div
                key={m.day}
                className={`flex-1 p-2 rounded-md border text-center transition-all ${
                  reached
                    ? "bg-gradient-to-br from-orange-500/30 to-pink-500/20 border-orange-400/50"
                    : "bg-muted/30 border-border/50 opacity-60"
                }`}
              >
                <div className="text-[10px] text-muted-foreground">Day</div>
                <div className="text-sm font-bold">{m.day}</div>
                <div className="text-[10px] text-orange-500 font-semibold">+{m.reward}</div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={claim}
          disabled={claimedToday || claiming}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90"
        >
          {claiming ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Claiming…</>
          ) : claimedToday ? (
            "✓ Claimed today — come back tomorrow"
          ) : (
            <><Gift className="h-4 w-4 mr-2" /> Claim +{nextReward} IQ credits</>
          )}
        </Button>

        {row && row.total_credits_earned > 0 && (
          <p className="text-[11px] text-center text-muted-foreground">
            Total earned from streaks: <span className="font-semibold text-orange-500">{row.total_credits_earned} credits</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
