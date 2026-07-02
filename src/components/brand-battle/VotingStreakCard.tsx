import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Coins, Clock } from "lucide-react";
import { useVotingStreak } from "@/hooks/useVotingStreak";
import { useBrandBattleCredits } from "@/hooks/useBrandBattleCredits";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const VotingStreakCard = () => {
  const { data: streak, isLoading: streakLoading } = useVotingStreak();
  const { data: credits, isLoading: creditsLoading } = useBrandBattleCredits();
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return (
    <>
      <FloatingHowItWorks title={"Voting Streak Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Voting Streak Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voting Streak Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(interval);
  }, []);

  if (streakLoading || creditsLoading) return null;

  const streakDays = streak?.currentStreak || 0;
  const daysUntilBonus = 7 - (streakDays % 7);
  const isCloseToBonus = daysUntilBonus <= 2 && daysUntilBonus > 0;

  const stats = [
    { icon: Flame, value: streakDays, label: "Day Streak", color: "text-orange-500" },
    { icon: Coins, value: credits?.creditsBalance || 0, label: "Credits", color: "text-yellow-500" },
    { icon: Trophy, value: streak?.longestStreak || 0, label: "Best Streak", color: "text-purple-500" },
  ];

  return (
    <Card className="p-4 backdrop-blur-xl bg-card/80 border-primary/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            {stat.label === "Day Streak" && isCloseToBonus && (
              <Badge variant="secondary" className="mt-1 text-[10px] animate-pulse">
                {daysUntilBonus} days to +20 bonus!
              </Badge>
            )}
          </motion.div>
        ))}

        {/* Time Until Reset */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-lg font-mono font-bold text-primary">{timeUntilReset}</span>
          </div>
          <p className="text-xs text-muted-foreground">Votes Reset In</p>
        </motion.div>
      </div>
    </Card>
  );
};
