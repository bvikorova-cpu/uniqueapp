import { Card } from "@/components/ui/card";
import { Flame, BarChart3, Trophy, TrendingUp, Target, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EngagementData {
  streak: number;
  weeklyActivity: number[];
  weeklyChange: number;
  totalXP: number;
  level: number;
  levelProgress: number;
  badgesEarned: number;
  totalBadges: number;
  dailyChallengeCompleted: boolean;
}

const XP_PER_LEVEL = 200;

export function TutorialEngagement() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  useEffect(() => {
    loadEngagement();
  }, []);

  const loadEngagement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData({ streak: 0, weeklyActivity: [0,0,0,0,0,0,0], weeklyChange: 0, totalXP: 0, level: 1, levelProgress: 0, badgesEarned: 0, totalBadges: 25, dailyChallengeCompleted: false });
        setLoading(false);
        return;
      }

      // Get this week's activity
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const lastWeekStart = new Date(startOfWeek);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const [activityRes, lastWeekRes, quizRes, enrollRes] = await Promise.all([
        supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("created_at", startOfWeek.toISOString()),
        supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("created_at", lastWeekStart.toISOString()).lt("created_at", startOfWeek.toISOString()),
        supabase.from("quiz_attempts").select("*").eq("user_id", user.id),
        supabase.from("course_enrollments").select("*").eq("user_id", user.id),
      ]);

      const thisWeekActivities = activityRes.data || [];
      const lastWeekActivities = lastWeekRes.data || [];
      const quizzes = quizRes.data || [];
      const enrollments = enrollRes.data || [];

      // Weekly activity per day
      const weeklyActivity = [0,0,0,0,0,0,0];
      thisWeekActivities.forEach(a => {
        const day = new Date(a.created_at!).getDay();
        const idx = day === 0 ? 6 : day - 1;
        weeklyActivity[idx] += a.points_earned;
      });

      const thisWeekTotal = thisWeekActivities.reduce((s, a) => s + a.points_earned, 0);
      const lastWeekTotal = lastWeekActivities.reduce((s, a) => s + a.points_earned, 0);
      const weeklyChange = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;

      // Calculate total XP from all sources
      const allXP = (activityRes.data || []).reduce((s, a) => s + a.points_earned, 0) + quizzes.length * 10 + enrollments.length * 20;
      const level = Math.max(1, Math.floor(allXP / XP_PER_LEVEL) + 1);
      const levelProgress = ((allXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

      // Streak: count consecutive days with activity (looking back from today)
      let streak = 0;
      const daySet = new Set<string>();
      thisWeekActivities.forEach(a => daySet.add(new Date(a.created_at!).toDateString()));
      // Also check beyond this week
      const checkDate = new Date();
      for (let i = 0; i < 30; i++) {
        if (daySet.has(checkDate.toDateString()) || i === 0) {
          // For today, check if there's activity; if not, check yesterday
          if (daySet.has(checkDate.toDateString())) {
            streak++;
          } else if (i === 0) {
            // Today has no activity yet, that's ok - don't break streak
          } else {
            break;
          }
        } else {
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Badges: simple count based on milestones
      let badges = 0;
      if (quizzes.length > 0) badges++;
      if (quizzes.length >= 5) badges++;
      if (quizzes.length >= 10) badges++;
      if (quizzes.filter(q => q.passed).length > 0) badges++;
      if (enrollments.length > 0) badges++;
      if (enrollments.length >= 3) badges++;
      if (allXP >= 100) badges++;
      if (allXP >= 500) badges++;
      if (allXP >= 1000) badges++;
      if (streak >= 3) badges++;
      if (streak >= 7) badges++;

      // Daily challenge: did user complete a quiz today?
      const todayStr = new Date().toDateString();
      const dailyChallengeCompleted = quizzes.some(q => new Date(q.attempted_at!).toDateString() === todayStr);

      setData({
        streak,
        weeklyActivity,
        weeklyChange,
        totalXP: allXP,
        level,
        levelProgress,
        badgesEarned: badges,
        totalBadges: 25,
        dailyChallengeCompleted,
      });
    } catch (err) {
      console.error("Failed to load engagement:", err);
      setData({ streak: 0, weeklyActivity: [0,0,0,0,0,0,0], weeklyChange: 0, totalXP: 0, level: 1, levelProgress: 0, badgesEarned: 0, totalBadges: 25, dailyChallengeCompleted: false });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Tutorial Engagement - How it works"} steps={[{ title: 'Open', desc: 'Access the Tutorial Engagement section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tutorial Engagement.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </>
  );
  }

  const d = data!;
  const nextBadgeAt = d.badgesEarned < 10 ? 10 : d.badgesEarned < 15 ? 15 : 25;

  return (
    <div className="space-y-3 mb-8">
      {/* Daily Streak Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/5 border-orange-200/50 dark:border-orange-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-sm">Daily Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-orange-500">{d.streak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {weekDays.map((day, i) => (
              <div key={day} className="flex-1 text-center">
                <div className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-1 ${
                  i === todayIndex 
                    ? 'bg-orange-500 text-white ring-2 ring-orange-300 dark:ring-orange-500/50' 
                    : d.weeklyActivity[i] > 0
                      ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' 
                      : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {day}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] md:text-xs font-bold">Weekly</span>
            </div>
            <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              +{d.weeklyActivity.reduce((a, b) => a + b, 0)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] md:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {d.weeklyChange >= 0 ? "↑" : "↓"} {Math.abs(d.weeklyChange)}%
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-3 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <span className="text-[10px] md:text-xs font-bold">XP Level</span>
            </div>
            <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Lv. {d.level}</p>
            <Progress value={d.levelProgress} className="h-1 mt-1.5" />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span className="text-[10px] md:text-xs font-bold">Badges</span>
            </div>
            <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{d.badgesEarned}/{d.totalBadges}</p>
            <p className="text-[9px] md:text-xs text-muted-foreground mt-1">{nextBadgeAt - d.badgesEarned} to 🏅 next</p>
          </Card>
        </motion.div>
      </div>

      {/* Daily Challenge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="p-3 bg-gradient-to-r from-rose-500/10 to-violet-500/10 border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Daily Challenge</p>
                <p className="text-[10px] text-muted-foreground">Complete 1 quiz to earn 50 XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${d.dailyChallengeCompleted ? 'text-emerald-500' : 'text-rose-500'}`}>
                {d.dailyChallengeCompleted ? '✅ Done!' : '+50 XP'}
              </p>
              <Progress value={d.dailyChallengeCompleted ? 100 : 0} className="h-1 w-16 mt-1" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
