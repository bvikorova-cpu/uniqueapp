import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Gift, Clock, CheckCircle2, Flame, Zap, Shield, Heart, Star, Coins, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: "training" | "racing" | "breeding" | "social";
  requirement: number;
  reward: { coins: number; xp: number };
  icon: string;
  stat?: string;
}

const DAILY_QUESTS: Quest[] = [
  { id: "train_speed_3", title: "Speed Drills", description: "Complete 3 speed training sessions", type: "training", requirement: 3, reward: { coins: 50, xp: 30 }, icon: "⚡", stat: "speed" },
  { id: "train_stamina_3", title: "Endurance Run", description: "Complete 3 stamina training sessions", type: "training", requirement: 3, reward: { coins: 50, xp: 30 }, icon: "💪", stat: "stamina" },
  { id: "race_1", title: "Track Time", description: "Enter and complete 1 race", type: "racing", requirement: 1, reward: { coins: 75, xp: 50 }, icon: "🏁" },
  { id: "race_3", title: "Race Day", description: "Complete 3 races today", type: "racing", requirement: 3, reward: { coins: 150, xp: 100 }, icon: "🏇" },
  { id: "train_any_5", title: "Training Montage", description: "Complete 5 training sessions of any type", type: "training", requirement: 5, reward: { coins: 100, xp: 75 }, icon: "🎯" },
  { id: "win_1", title: "Victory Lap", description: "Win 1 race today", type: "racing", requirement: 1, reward: { coins: 200, xp: 150 }, icon: "🏆" },
];

const WEEKLY_CHALLENGES: Quest[] = [
  { id: "weekly_train_20", title: "Training Master", description: "Complete 20 training sessions this week", type: "training", requirement: 20, reward: { coins: 500, xp: 300 }, icon: "🔥" },
  { id: "weekly_race_10", title: "Track Veteran", description: "Complete 10 races this week", type: "racing", requirement: 10, reward: { coins: 750, xp: 500 }, icon: "🎖️" },
  { id: "weekly_win_5", title: "Champion's Streak", description: "Win 5 races this week", type: "racing", requirement: 5, reward: { coins: 1000, xp: 750 }, icon: "👑" },
];

export const DailyTrainingQuests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: questProgress = {}, isLoading } = useQuery({
    queryKey: ["daily-quest-progress"],
    queryFn: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return {};
      const { data } = await (supabase as any)
        .from("horse_daily_quests")
        .select("*")
        .eq("user_id", u.id)
        .gte("created_at", new Date().toISOString().split("T")[0]);
      const progress: Record<string, number> = {};
      data?.forEach((q: any) => { progress[q.quest_id] = q.progress || 0; });
      return progress;
    },
  });

  const claimReward = useMutation({
    mutationFn: async (questId: string) => {
      const { data, error } = await supabase.functions.invoke("horse-claim-quest-reward", {
        body: { questId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, questId) => {
      toast.success("Quest reward claimed!");
      queryClient.invalidateQueries({ queryKey: ["daily-quest-progress"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getQuestStatus = (quest: Quest) => {
    const progress = (questProgress as Record<string, number>)[quest.id] || 0;
    const completed = progress >= quest.requirement;
    return { progress, completed, percentage: Math.min((progress / quest.requirement) * 100, 100) };
  };

  // Time until daily reset
  const now = new Date();
  const resetTime = new Date(now);
  resetTime.setHours(24, 0, 0, 0);
  const hoursLeft = Math.floor((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesLeft = Math.floor(((resetTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  const renderQuestCard = (quest: Quest, i: number) => {
    const { progress, completed, percentage } = getQuestStatus(quest);
    
    return (
    <>
      <FloatingHowItWorks title={"Daily Training Quests - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Training Quests section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Training Quests.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
        key={quest.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <Card className={`p-4 backdrop-blur-sm transition-all ${
          completed 
            ? "bg-emerald-950/30 border-emerald-500/30" 
            : "bg-slate-900/60 border-amber-500/15 hover:border-amber-400/30"
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">{quest.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold font-mono text-sm text-white truncate">{quest.title}</h3>
                {completed && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-amber-400/40 font-mono mb-2">{quest.description}</p>
              
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${completed ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-red-500"}`}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400/50">
                  {progress}/{quest.requirement}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-400">
                    🪙 {quest.reward.coins}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    ⭐ {quest.reward.xp} XP
                  </span>
                </div>
              </div>
            </div>

            {completed && (
              <Button size="sm" onClick={() => {
                if (!user) { navigate("/auth"); return; }
                claimReward.mutate(quest.id);
              }}
                disabled={claimReward.isPending}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-mono text-[10px] shrink-0"
              >
                <Gift className="h-3 w-3 mr-1" /> Claim
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </>
  );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black font-mono flex items-center gap-2 text-white">
            <Target className="h-6 w-6 text-amber-400" /> Daily Quests
          </h2>
          <p className="text-amber-400/50 font-mono text-sm">Complete quests for bonus coins and XP</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 rounded-lg border border-amber-500/15">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono text-amber-400">{hoursLeft}h {minutesLeft}m</span>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <h3 className="font-mono text-sm text-amber-400/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4" /> Daily Quests
        </h3>
        <div className="space-y-2">
          {DAILY_QUESTS.map((q, i) => renderQuestCard(q, i))}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div>
        <h3 className="font-mono text-sm text-amber-400/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Star className="h-4 w-4" /> Weekly Challenges
        </h3>
        <div className="space-y-2">
          {WEEKLY_CHALLENGES.map((q, i) => renderQuestCard(q, i))}
        </div>
      </div>

      <Card className="p-4 bg-slate-900/40 border-amber-500/10">
        <h3 className="font-bold font-mono text-sm text-amber-300 mb-2">🎯 Quest Info</h3>
        <ul className="text-xs text-amber-400/50 font-mono space-y-1">
          <li>• Daily quests reset every day at midnight UTC</li>
          <li>• Weekly challenges reset every Monday</li>
          <li>• Quest progress is tracked automatically from your activities</li>
          <li>• Unclaimed rewards expire when quests reset</li>
        </ul>
      </Card>
    </div>
  );
};
