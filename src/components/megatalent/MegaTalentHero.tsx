import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Clock, Flame, Crown, Sparkles } from "lucide-react";
import heroVideo from "@/assets/megatalent-hero.mp4.asset.json";
import { useMegatalentContestStats } from "@/hooks/useMegatalentContestStats";

function getContestTimeLeft() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = lastDay.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours };
}

interface MegaTalentHeroProps {
  totalVotes: number;
  isSubscribed: boolean;
  subscriptionTier: "premium" | "top_premium" | null;
}

export default function MegaTalentHero({ totalVotes, isSubscribed, subscriptionTier }: MegaTalentHeroProps) {
  const [timeLeft, setTimeLeft] = useState(getContestTimeLeft());
  const { data: stats } = useMegatalentContestStats();

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getContestTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Stable defaults prevent hero "flash of empty" (TBA / em-dash) before query resolves
  const prizePoolLabel = stats?.prizePool ? stats.prizePoolFormatted : "€10,000";
  const categoryLabel = stats ? `${stats.categoryCount}` : "36";

  const statCards = [
    { value: `${timeLeft.days}d ${timeLeft.hours}h`, label: "Time Left", icon: Clock, accent: "from-red-500/20 to-orange-500/10", iconColor: "text-red-400" },
    { value: prizePoolLabel, label: "Prize Pool", icon: Trophy, accent: "from-yellow-500/20 to-amber-500/10", iconColor: "text-yellow-400" },
    { value: totalVotes.toLocaleString(), label: "Your Votes", icon: Heart, accent: "from-pink-500/20 to-red-500/10", iconColor: "text-pink-400" },
    { value: categoryLabel, label: "Categories", icon: Sparkles, accent: "from-purple-500/20 to-violet-500/10", iconColor: "text-purple-400" },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Video Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl min-h-[260px] sm:min-h-[340px]"
      >
        <div className="absolute inset-0 z-0">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(1.1) saturate(1.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 via-transparent to-amber-900/10" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col min-h-[260px] sm:min-h-[340px]">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-yellow-500/90 text-black font-bold border-yellow-400/50 shadow-lg shadow-yellow-500/20 text-[10px] px-2 py-0.5">
                <Trophy className="h-3 w-3 mr-1" /> Monthly Prize Pool: {prizePoolLabel}
              </Badge>
            </motion.div>
            {isSubscribed && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 text-[10px] px-2 py-0.5">
                  <Crown className="h-3 w-3 mr-1" />
                  {subscriptionTier === "top_premium" ? "TOP Premium" : "Premium"} Active
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Title at bottom */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-yellow-500/30 bg-black/30 backdrop-blur-md rounded-xl px-4 py-3 w-fit max-w-full mt-auto"
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white drop-shadow-lg">
              ⚡ MEGA<span className="text-yellow-400">TALENT</span> ⚡
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-semibold mt-0.5 drop-shadow">
              Showcase your talent, compete across {categoryLabel} categories, win the monthly prize pool!
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stat Cards Below Video */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
            className={`rounded-xl bg-gradient-to-br ${item.accent} bg-card/80 backdrop-blur-md border border-yellow-400/20 p-3 sm:p-4 text-center`}
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
