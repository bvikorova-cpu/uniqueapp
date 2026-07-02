import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Flame, Crown, Gem, TrendingUp } from "lucide-react";
import heroVideo from "@/assets/rewards-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

function getWeeklyTimeLeft() {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const diff = endOfWeek.getTime() - now.getTime();
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000) };
}

interface RewardsCinematicHeroProps {
  level: number;
  totalXP: number;
  streak: number;
  badges: number;
}

export default function RewardsCinematicHero({ level, totalXP, streak, badges }: RewardsCinematicHeroProps) {
  const [timeLeft, setTimeLeft] = useState(getWeeklyTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getWeeklyTimeLeft()), 60000);
    return (
    <>
      <FloatingHowItWorks title={"Rewards Cinematic Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Rewards Cinematic Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Rewards Cinematic Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  const statCards = [
    { value: level > 0 ? level.toString() : "—", label: "Level", icon: Crown, accent: "from-amber-500/20 to-yellow-500/10", iconColor: "text-amber-400" },
    { value: totalXP > 0 ? totalXP.toLocaleString() : "—", label: "Total XP", icon: Star, accent: "from-yellow-500/20 to-orange-500/10", iconColor: "text-yellow-400" },
    { value: streak > 0 ? `${streak}d` : "0d", label: "Streak", icon: Flame, accent: "from-orange-500/20 to-red-500/10", iconColor: "text-orange-400" },
    { value: badges > 0 ? badges.toString() : "—", label: "Badges", icon: Gem, accent: "from-purple-500/20 to-violet-500/10", iconColor: "text-purple-400" },
  ];

  return (
    <div className="space-y-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl min-h-[280px] sm:min-h-[360px]"
      >
        <div className="absolute inset-0 z-0">
          <video src={heroVideo.url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ filter: "brightness(0.85) saturate(1.2)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1000]/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/15 via-transparent to-yellow-900/10" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col min-h-[280px] sm:min-h-[360px]">
          {/* Top badges - compact */}
          <div className="flex flex-wrap items-center gap-2 mb-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold border-amber-400/50 shadow-lg shadow-amber-500/30 text-[10px] px-2 py-0.5">
                <TrendingUp className="h-3 w-3 mr-1" /> Golden Treasury
              </Badge>
            </motion.div>
            {streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400/50 text-[10px] px-2 py-0.5">
                  <Flame className="h-3 w-3 mr-1" /> {streak} Day Streak
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Title at bottom - compact glassmorphic frame */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-amber-400/30 bg-black/30 backdrop-blur-md rounded-xl px-4 py-3 w-fit max-w-full mt-auto"
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white drop-shadow-lg">
              🏆 REWARDS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300">CENTER</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-semibold mt-0.5 drop-shadow">
              Earn XP, unlock badges & climb the leaderboard
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
            className={`rounded-xl bg-gradient-to-br ${item.accent} bg-card/80 backdrop-blur-md border border-amber-400/20 p-3 sm:p-4 text-center`}
          >
            <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.iconColor} mx-auto mb-1`} />
            <p className="text-lg sm:text-2xl font-black">{item.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
