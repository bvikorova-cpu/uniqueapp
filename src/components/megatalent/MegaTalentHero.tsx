import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Heart, Clock, Flame, Star } from "lucide-react";

function getContestTimeLeft() {
  const now = new Date();
  const startDate = new Date("2026-01-01");

  if (now < startDate) {
    const diff = startDate.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return { days, hours, minutes, started: false };
  }

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = lastDay.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes, started: true };
}

interface MegaTalentHeroProps {
  totalVotes: number;
  isSubscribed: boolean;
  subscriptionTier: "premium" | "top_premium" | null;
}

export default function MegaTalentHero({ totalVotes, isSubscribed, subscriptionTier }: MegaTalentHeroProps) {
  const [timeLeft, setTimeLeft] = useState(getContestTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getContestTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-4 sm:p-6 lg:p-8 mb-8"
    >
      {/* Animated glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.7s" }} />
      </div>

      <div className="relative z-10">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 font-bold">
              <Trophy className="h-3 w-3 mr-1" /> Monthly Prize: €10,000
            </Badge>
          </motion.div>
          {isSubscribed && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Star className="h-3 w-3 mr-1" />
                {subscriptionTier === "top_premium" ? "TOP Premium" : "Premium"} Active
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl lg:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2"
        >
          MegaTalent Contest
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl"
        >
          Showcase your talent, compete across 30+ categories, and win big prizes every month!
        </motion.p>

        {/* Countdown + Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Countdown blocks */}
          {[
            { value: timeLeft.days, label: "Days", color: "from-red-500/10 to-orange-500/5", icon: Clock, iconColor: "text-red-500" },
            { value: timeLeft.hours, label: "Hours", color: "from-orange-500/10 to-yellow-500/5", icon: Clock, iconColor: "text-orange-500" },
            { value: timeLeft.minutes, label: "Minutes", color: "from-yellow-500/10 to-amber-500/5", icon: Flame, iconColor: "text-yellow-500" },
            { value: totalVotes, label: "Your Votes", color: "from-primary/10 to-accent/5", icon: Heart, iconColor: "text-primary" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className={`rounded-xl bg-gradient-to-br ${item.color} border border-border/30 p-3 sm:p-4 text-center`}
            >
              <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.iconColor} mx-auto mb-1`} />
              <p className="text-xl sm:text-3xl font-black">
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {!timeLeft.started && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground mt-3 text-center"
          >
            Contest starts January 1, 2026 — Subscribe now to be ready!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
