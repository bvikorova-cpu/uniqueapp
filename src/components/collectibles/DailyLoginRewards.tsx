import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Flame, Star, Zap, Crown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

const dayRewards = [
  { day: 1, reward: "2 Credits", icon: Star, color: "text-blue-400" },
  { day: 2, reward: "3 Credits", icon: Star, color: "text-blue-400" },
  { day: 3, reward: "5 Credits", icon: Zap, color: "text-purple-400" },
  { day: 4, reward: "5 Credits", icon: Zap, color: "text-purple-400" },
  { day: 5, reward: "8 Credits", icon: Gift, color: "text-green-400" },
  { day: 6, reward: "10 Credits", icon: Gift, color: "text-green-400" },
  { day: 7, reward: "20 Credits + Mystery Box", icon: Crown, color: "text-amber-400" },
];

export default function DailyLoginRewards({ userId }: Props) {
  const queryClient = useQueryClient();

  const { data: streakData } = useQuery({
    queryKey: ["daily-reward-streak", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("activity_type", "daily_login_reward")
        .order("created_at", { ascending: false })
        .limit(7);

      if (error) throw error;

      const today = new Date().toDateString();
      const claimedToday = data?.some((log: any) => new Date(log.created_at).toDateString() === today);

      // Calculate streak
      let streak = 0;
      const sorted = (data || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      for (let i = 0; i < sorted.length; i++) {
        const expected = new Date();
        expected.setDate(expected.getDate() - i - (claimedToday ? 0 : 1));
        if (new Date(sorted[i].created_at).toDateString() === expected.toDateString()) {
          streak++;
        } else break;
      }

      return { streak: claimedToday ? streak : streak, claimedToday, currentDay: (streak % 7) + 1 };
    },
  });

  const claimReward = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("activity_logs").insert({
        user_id: userId,
        activity_type: "daily_login_reward",
        points_earned: dayRewards[(streakData?.currentDay || 1) - 1]?.day || 2,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reward-streak"] });
      toast.success("Daily reward claimed! 🎉");
    },
    onError: (e: any) => toast.error(e.message || "Failed to claim"),
  });

  const currentDay = streakData?.currentDay || 1;

  return (
    <>
      <FloatingHowItWorks title={"Daily Login Rewards - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Login Rewards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Login Rewards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-lime-500/10 to-green-500/10 border-lime-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-8 w-8 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold">Daily Login Rewards</h2>
            <p className="text-sm text-muted-foreground">Login daily to earn credits and bonuses — 7-day cycle</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">🔥 {streakData?.streak || 0} Day Streak</Badge>
          <Badge variant="secondary" className="text-sm">Day {currentDay}/7</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {dayRewards.map((dr) => {
          const isPast = dr.day < currentDay;
          const isCurrent = dr.day === currentDay;
          const isFuture = dr.day > currentDay;

          return (
            <Card
              key={dr.day}
              className={`p-4 text-center transition-all ${
                isPast ? "bg-primary/5 border-primary/20 opacity-60" :
                isCurrent ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 scale-105" :
                "opacity-50"
              }`}
            >
              <dr.icon className={`h-6 w-6 mx-auto mb-2 ${isPast ? "text-primary" : dr.color}`} />
              <p className="text-xs font-bold">Day {dr.day}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{dr.reward}</p>
              {isPast && <Badge className="mt-2 text-[9px]">✓</Badge>}
            </Card>
          );
        })}
      </div>

      <Card className="p-6 text-center">
        <Button
          onClick={() => claimReward.mutate()}
          disabled={streakData?.claimedToday || claimReward.isPending}
          size="lg"
          className="gap-2"
        >
          <Gift className="h-5 w-5" />
          {streakData?.claimedToday ? "Already Claimed Today" : `Claim Day ${currentDay} Reward`}
        </Button>
        {streakData?.claimedToday && (
          <p className="text-xs text-muted-foreground mt-2">Come back tomorrow for your next reward!</p>
        )}
      </Card>
    </div>
    </>
  );
}
