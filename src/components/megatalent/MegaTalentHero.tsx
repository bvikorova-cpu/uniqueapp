import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Heart, Clock, Flame, Star, Crown, Sparkles } from "lucide-react";
import heroVideo from "@/assets/megatalent-hero.mp4.asset.json";

function getContestTimeLeft() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = lastDay.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
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
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl mb-8 min-h-[340px] sm:min-h-[400px]"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: "brightness(1.3) saturate(1.2)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 via-transparent to-amber-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-h-[340px] sm:min-h-[400px]">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <Badge className="bg-yellow-500/90 text-black font-bold border-yellow-400/50 shadow-lg shadow-yellow-500/20">
              <Trophy className="h-3 w-3 mr-1" /> Monthly Prize: €10,000
            </Badge>
          </motion.div>
          {isSubscribed && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
              <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20">
                <Crown className="h-3 w-3 mr-1" />
                {subscriptionTier === "top_premium" ? "TOP Premium" : "Premium"} Active
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Title in glassmorphic frame */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="border-2 border-yellow-500/30 bg-black/40 backdrop-blur-lg rounded-xl px-5 py-4 mb-4 w-fit max-w-full"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
            ⚡ MEGA<span className="text-yellow-400">TALENT</span> ⚡
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-semibold mt-1 drop-shadow">
            Showcase your talent, compete across 30+ categories, win €10,000 every month!
          </p>
        </motion.div>

        {/* Stats Grid - Glassmorphic */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: `${timeLeft.days}d ${timeLeft.hours}h`, label: "Time Left", icon: Clock, accent: "from-red-500/20 to-orange-500/10" },
            { value: "€10,000", label: "Prize Pool", icon: Trophy, accent: "from-yellow-500/20 to-amber-500/10" },
            { value: totalVotes.toLocaleString(), label: "Your Votes", icon: Heart, accent: "from-pink-500/20 to-red-500/10" },
            { value: "30+", label: "Categories", icon: Sparkles, accent: "from-purple-500/20 to-violet-500/10" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className={`rounded-xl bg-gradient-to-br ${item.accent} bg-black/30 backdrop-blur-md border border-white/10 p-3 sm:p-4 text-center`}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-black text-white">{item.value}</p>
              <p className="text-[10px] sm:text-xs text-white/60">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
