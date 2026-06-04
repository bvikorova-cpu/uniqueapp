import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Target, Gift, Trophy, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MILESTONES = [
  { day: 3, reward: "🎯 Profile Boost", desc: "Your profile gets priority visibility for 24h" },
  { day: 7, reward: "⭐ Gold Badge", desc: "Earn the 'Consistent Applicant' badge" },
  { day: 14, reward: "🎁 5 Free Credits", desc: "Bonus AI credits for career tools" },
  { day: 21, reward: "🏆 Featured Profile", desc: "Appear in 'Top Candidates' section" },
  { day: 30, reward: "💎 Premium Trial", desc: "3-day premium access unlocked" },
  { day: 60, reward: "👑 Career Champion", desc: "Legendary badge + 15 free credits" },
  { day: 100, reward: "🌟 Hall of Fame", desc: "Permanent leaderboard spotlight" },
];

interface JobStreak {
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string | null;
  total_check_ins: number;
}

export default function JobsApplicationStreaks() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ["user_job_streaks", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<JobStreak> => {
      const { data, error } = await (supabase as any)
        .from("user_job_streaks")
        .select("current_streak, longest_streak, last_check_in_date, total_check_ins")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? { current_streak: 0, longest_streak: 0, last_check_in_date: null, total_check_ins: 0 }
      );
    },
  });

  const currentStreak = streak?.current_streak ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = streak?.last_check_in_date === today;

  const checkIn = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc("record_job_checkin");
      if (error) throw error;
      return data as {
        current_streak: number;
        longest_streak: number;
        total_check_ins: number;
        already_checked: boolean;
        xp_awarded: number;
        error?: string;
      };
    },
    onSuccess: (res) => {
      if (res?.error) {
        toast.error("Please sign in to check in");
        return;
      }
      if (res.already_checked) {
        toast.info("You already checked in today");
      } else {
        toast.success(
          `Day ${res.current_streak} streak! +${res.xp_awarded} XP 🔥`
        );
      }
      qc.invalidateQueries({ queryKey: ["user_job_streaks", user?.id] });
      qc.invalidateQueries({ queryKey: ["rewards-stats"] });
      qc.invalidateQueries({ queryKey: ["my-progress-days", user?.id] });
    },
    onError: (e: any) => toast.error(e.message ?? "Check-in failed"),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-black">🔥 Application Streaks</h2>

      <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
            <Flame className="h-10 w-10 text-white" />
          </div>
          <p className="text-4xl font-black mb-1">{isLoading ? "…" : currentStreak}</p>
          <p className="text-sm text-muted-foreground mb-1">Day Streak</p>
          {streak && (
            <p className="text-xs text-muted-foreground mb-4">
              Longest: {streak.longest_streak} · Total: {streak.total_check_ins}
            </p>
          )}
          <Button
            onClick={() => checkIn.mutate()}
            disabled={checkedToday || checkIn.isPending || !user}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            {checkIn.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
            ) : checkedToday ? (
              <><CheckCircle className="h-4 w-4 mr-2" /> Checked In Today</>
            ) : (
              <><Target className="h-4 w-4 mr-2" /> Daily Check-in</>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2"><Gift className="h-4 w-4 text-amber-400" /> Milestone Rewards</h3>
        {MILESTONES.map((m, i) => {
          const unlocked = currentStreak >= m.day;
          return (
            <motion.div key={m.day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-border/30 ${unlocked ? "bg-amber-500/10 border-amber-500/30" : "bg-card/50 opacity-60"}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${unlocked ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {m.day}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{m.reward}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {unlocked ? (
                    <Trophy className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Badge variant="outline" className="text-[10px]">{m.day - currentStreak}d</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
