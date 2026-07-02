import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Gift, Zap, Crown, Star, Trophy, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const streakRewards = [
  { day: 3, credits: 2, icon: Gift },
  { day: 7, credits: 5, icon: Star },
  { day: 14, credits: 10, icon: Zap },
  { day: 30, credits: 25, icon: Crown },
  { day: 60, credits: 50, icon: Trophy },
  { day: 100, credits: 100, icon: Flame },
];

interface IQBrainStreaksProps {
  currentStreak: number;
}

export default function IQBrainStreaks({ currentStreak }: IQBrainStreaksProps) {
  const [claimed, setClaimed] = useState<number[]>([]);
  const [pending, setPending] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("iq_streak_claims")
        .select("day_milestone")
        .eq("user_id", user.id);
      if (data) setClaimed(data.map((d: { day_milestone: number }) => d.day_milestone));
    })();
  }, [currentStreak]);

  const claim = async (day: number) => {
    setPending(day);
    const { data, error } = await supabase.rpc("claim_iq_streak_reward", { _day: day });
    setPending(null);
    if (error) {
      toast({ title: "Claim failed", description: error.message, variant: "destructive" });
      return;
    }
    const res = data as { error?: string; ok?: boolean; credits?: number };
    if (res?.error) {
      toast({ title: "Cannot claim", description: res.error.replace(/_/g, " "), variant: "destructive" });
      return;
    }
    toast({ title: "🎁 Reward claimed!", description: `+${res.credits} IQ credits` });
    setClaimed((c) => [...c, day]);
    qc.invalidateQueries({ queryKey: ["iq-credits"] });
  };

  return (
    <>
      <FloatingHowItWorks title="How IQBrain Streaks works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🔥 Brain Streaks</h2>
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{currentStreak} Days</p>
              <p className="text-xs text-muted-foreground">Current Brain Streak</p>
            </div>
            <Badge className="ml-auto bg-orange-500/20 text-orange-500 border-orange-500/30">
              Train daily to keep your streak!
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {streakRewards.map((sr, i) => {
              const reached = currentStreak >= sr.day;
              const isClaimed = claimed.includes(sr.day);
              return (
                <motion.div
                  key={sr.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`text-center p-3 transition-all ${reached ? "border-orange-500/50 bg-orange-500/10" : "opacity-50"}`}>
                    <sr.icon className={`h-5 w-5 mx-auto mb-1 ${reached ? "text-orange-500" : "text-muted-foreground"}`} />
                    <p className="text-xs font-bold">Day {sr.day}</p>
                    <p className="text-[9px] text-muted-foreground mb-1.5">+{sr.credits} CR</p>
                    {isClaimed ? (
                      <Badge className="text-[8px] bg-green-500 text-white"><Check className="h-2.5 w-2.5 mr-0.5" /> Claimed</Badge>
                    ) : reached ? (
                      <Button
                        size="sm"
                        className="h-6 text-[9px] w-full bg-orange-500 hover:bg-orange-600"
                        disabled={pending === sr.day}
                        onClick={() => claim(sr.day)}
                      >
                        {pending === sr.day ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "Claim"}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[8px]">{sr.day - currentStreak}d left</Badge>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
}
