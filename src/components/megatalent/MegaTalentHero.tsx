import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Clock, Flame, Crown, Sparkles } from "lucide-react";
import heroVideo from "@/assets/megatalent-hero.mp4.asset.json";
import { useMegatalentContestStats } from "@/hooks/useMegatalentContestStats";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

function getContestTimeLeft() {
  const now = new Date();
  // Quarterly cycle — ends on the last day of the current calendar quarter (UTC).
  const quarter = Math.floor(now.getUTCMonth() / 3);
  const quarterEndMonth = quarter * 3 + 3; // 3, 6, 9, 12
  const end = new Date(Date.UTC(now.getUTCFullYear(), quarterEndMonth, 0, 23, 59, 59));
  const diff = Math.max(0, end.getTime() - now.getTime());
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
  const prizePoolLabel = stats?.prizePool ? stats.prizePoolFormatted : "—";
  const categoryLabel = stats ? `${stats.categoryCount}` : "36";




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
            style={{ filter: "brightness(1.1) saturate(1.15)", objectPosition: "center 35%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 via-transparent to-amber-900/10" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col min-h-[260px] sm:min-h-[340px]">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-yellow-500/90 text-black font-bold border-yellow-400/50 shadow-lg shadow-yellow-500/20 text-[10px] px-2 py-0.5">
                <Trophy className="h-3 w-3 mr-1" /> Quarterly Prize Pool: {prizePoolLabel}
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
              Showcase your talent, compete across {categoryLabel} categories, win the quarterly prize pool!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>

  );
}
