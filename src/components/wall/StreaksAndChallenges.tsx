import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Target, Trophy, Zap, ChevronRight, Star, Calendar, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  progress: number;
  target: number;
  type: "daily" | "weekly" | "community";
  participants?: number;
  endsIn?: string;
}

interface DBChallenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  challenge_type: "daily" | "weekly" | "community";
  target_count: number;
  xp_reward: number;
  progress: number;
  completed: boolean;
  ends_at: string | null;
}

function formatEndsIn(endsAt: string | null): string | undefined {
  if (!endsAt) return undefined;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return "ended";
  const days = Math.ceil(ms / 86400000);
  return days === 1 ? "1 day" : `${days} days`;
}


export function StreaksAndChallenges() {
  const [activeTab, setActiveTab] = useState<"streak" | "challenges">("streak");
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["user-streak"] });
      qc.invalidateQueries({ queryKey: ["streak-week"] });
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
    };
    window.addEventListener("streak-updated", handler);
    window.addEventListener("challenges-updated", handler);
    return () => {
      window.removeEventListener("streak-updated", handler);
      window.removeEventListener("challenges-updated", handler);
    };
  }, [qc]);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Real streak data
  const { data: streakRow } = useQuery({
    queryKey: ["user-streak", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak,longest_streak,total_xp,last_active_date")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: week } = useQuery({
    queryKey: ["streak-week", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.rpc("get_streak_week");
      return (data ?? []) as Array<{ day_date: string; is_active: boolean; xp_earned: number }>;
    },
  });

  const streakDays = streakRow?.current_streak ?? 0;
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const activeWeekDays = weekDays.map((_, i) => week?.[i]?.is_active ?? false);
  const currentXP = streakRow?.total_xp ?? 0;
  const level = Math.floor(currentXP / 200) + 1;
  const nextLevelXP = level * 200;
  const todayXP = week?.find(d => d.day_date === new Date().toISOString().slice(0, 10))?.xp_earned ?? 0;

  const dailyChallenges = mockChallenges.filter((c) => c.type === "daily");
  const weeklyChallenges = mockChallenges.filter((c) => c.type === "weekly");
  const communityChallenges = mockChallenges.filter((c) => c.type === "community");


  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-accent/20 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("streak")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "streak" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flame className="h-3.5 w-3.5" />
          Streak
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "challenges" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Target className="h-3.5 w-3.5" />
          Challenges
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "streak" ? (
          <motion.div
            key="streak"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Streak counter */}
            <div className="text-center space-y-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-2xl"
              >
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-2xl font-black">{streakDays}</span>
                <span className="text-sm font-semibold text-muted-foreground">day streak</span>
              </motion.div>
            </div>

            {/* Week view */}
            <div className="flex justify-between px-2">
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                      activeWeekDays[i]
                        ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                        : "bg-accent/30 text-muted-foreground"
                    )}
                  >
                    {activeWeekDays[i] ? "🔥" : "○"}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Level & XP */}
            <div className="space-y-2 bg-accent/10 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Level {level}</p>
                    <p className="text-[10px] text-muted-foreground">{currentXP} / {nextLevelXP} XP</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <Zap className="h-3 w-3 mr-0.5 text-yellow-500" />
                  +{todayXP} XP today
                </Badge>
              </div>
              <Progress value={(currentXP / nextLevelXP) * 100} className="h-2" />
            </div>

            {/* Daily bonuses */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "📝", label: "Post", xp: "+20" },
                { icon: "💬", label: "Comment", xp: "+10" },
                { icon: "📖", label: "Story", xp: "+15" },
              ].map((bonus) => (
                <div
                  key={bonus.label}
                  className="text-center bg-accent/20 rounded-xl p-2 hover:bg-accent/30 transition-colors cursor-pointer"
                >
                  <span className="text-lg">{bonus.icon}</span>
                  <p className="text-[10px] font-medium mt-0.5">{bonus.label}</p>
                  <p className="text-[9px] text-primary font-bold">{bonus.xp}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {/* Daily Challenges */}
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Daily Challenges
              </h4>
              <div className="space-y-2">
                {dailyChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    expanded={expandedChallenge === challenge.id}
                    onToggle={() =>
                      setExpandedChallenge(expandedChallenge === challenge.id ? null : challenge.id)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Weekly */}
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Weekly
              </h4>
              {weeklyChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  expanded={expandedChallenge === challenge.id}
                  onToggle={() =>
                    setExpandedChallenge(expandedChallenge === challenge.id ? null : challenge.id)
                  }
                />
              ))}
            </div>

            {/* Community */}
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Community
              </h4>
              {communityChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  expanded={expandedChallenge === challenge.id}
                  onToggle={() =>
                    setExpandedChallenge(expandedChallenge === challenge.id ? null : challenge.id)
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChallengeCard({
  challenge,
  expanded,
  onToggle,
}: {
  challenge: Challenge;
  expanded: boolean;
  onToggle: () => void;
}) {
  const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
  const isComplete = challenge.progress >= challenge.target;

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={cn(
        "rounded-xl p-3 cursor-pointer transition-all",
        isComplete
          ? "bg-primary/10 border border-primary/20"
          : "bg-accent/20 hover:bg-accent/30"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{challenge.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold truncate">{challenge.title}</p>
            {isComplete && (
              <Badge className="bg-primary/20 text-primary text-[8px] px-1 h-4">
                ✓ Done
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-1.5 mt-1" />
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold text-primary">+{challenge.xpReward} XP</p>
          <p className="text-[9px] text-muted-foreground">
            {challenge.progress}/{challenge.target}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pt-2 border-t border-border/30"
          >
            <p className="text-[11px] text-muted-foreground">{challenge.description}</p>
            <div className="flex items-center gap-3 mt-2">
              {challenge.participants && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {challenge.participants.toLocaleString()} joined
                </span>
              )}
              {challenge.endsIn && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Ends in {challenge.endsIn}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
