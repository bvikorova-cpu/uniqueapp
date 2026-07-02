import { motion } from "framer-motion";
import { Trophy, Star, Flame, Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGamification, useDailyReward } from "@/hooks/useGamification";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const calculateLevelProgress = (currentLevel: number, totalPoints: number) => {
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = totalPoints - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  return { current: xpInCurrentLevel, needed: xpNeededForLevel, percentage: progressPercentage, nextLevel: currentLevel + 1 };
};

export default function RewardsHeroSection() {
  const [userId, setUserId] = useState<string | undefined>();
  const { data } = useGamification(userId);
  const { checkCanClaim } = useDailyReward();
  const streak = checkCanClaim.data?.streak || 0;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  const level = data?.points?.level || 1;
  const totalXP = data?.points?.total_points || 0;
  const progress = calculateLevelProgress(level, totalXP);
  const badgeCount = data?.userAchievements?.length || 0;

  return (
    <>
      <FloatingHowItWorks title={"Rewards Hero Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Rewards Hero Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Rewards Hero Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-4 sm:p-6 lg:p-8 mb-8"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
              <Zap className="h-3 w-3 mr-1" /> Rewards Center
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Your Progress
            </h1>
          </motion.div>

          {/* Streak flame */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30"
            >
              <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
              <span className="font-bold text-orange-500">{streak} Day Streak</span>
            </motion.div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { icon: Trophy, label: "Level", value: level, color: "text-yellow-500", bg: "from-yellow-500/10 to-amber-500/5" },
            { icon: Star, label: "Total XP", value: totalXP.toLocaleString(), color: "text-primary", bg: "from-primary/10 to-primary/5" },
            { icon: Flame, label: "Streak", value: `${streak}d`, color: "text-orange-500", bg: "from-orange-500/10 to-red-500/5" },
            { icon: TrendingUp, label: "Badges", value: badgeCount, color: "text-accent", bg: "from-accent/10 to-pink-500/5" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className={`rounded-xl bg-gradient-to-br ${stat.bg} border border-border/30 p-3 sm:p-4 text-center`}
            >
              <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg sm:text-2xl font-black">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Level progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Level {level}</span>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {progress.current} / {progress.needed} XP to Level {progress.nextLevel}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress.percentage} className="h-3 sm:h-4" />
            <div
              className="absolute inset-0 rounded-full bg-primary/20 blur-sm -z-10"
              style={{ opacity: progress.percentage > 0 ? 0.5 : 0 }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
