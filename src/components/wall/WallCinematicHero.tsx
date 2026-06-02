import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MessageCircle, Users, Heart, Globe, TrendingUp, Flame, Zap, Info } from "lucide-react";
import heroVideo from "@/assets/wall-hero.mp4.asset.json";

function getWeeklyTimeLeft() {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const diff = endOfWeek.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours };
}

interface WallCinematicHeroProps {
  totalPosts: number;
  totalUsers: number;
  totalLikes: number;
  streak: number;
}

export default function WallCinematicHero({ totalPosts, totalUsers, totalLikes, streak }: WallCinematicHeroProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(getWeeklyTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getWeeklyTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  const statCards = [
    { value: totalPosts.toLocaleString(), label: "Posts Today", icon: MessageCircle, accent: "from-orange-500/20 to-coral-500/10", iconColor: "text-orange-400", tooltip: t("wall.tooltip.postsToday") },
    { value: totalUsers.toLocaleString(), label: "Active Users", icon: Users, accent: "from-teal-500/20 to-cyan-500/10", iconColor: "text-teal-400", tooltip: t("wall.tooltip.activeUsers") },
    { value: totalLikes.toLocaleString(), label: "Interactions", icon: Heart, accent: "from-rose-500/20 to-pink-500/10", iconColor: "text-rose-400", tooltip: t("wall.tooltip.interactions") },
    { value: `${timeLeft.days}d ${timeLeft.hours}h`, label: "Challenge Ends", icon: Zap, accent: "from-amber-500/20 to-yellow-500/10", iconColor: "text-amber-400", tooltip: t("wall.tooltip.challengeEnds") },
  ];

  return (
    <div className="space-y-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl min-h-[240px] sm:min-h-[320px]"
      >
        <div className="absolute inset-0 z-0">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.8) saturate(1.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a]/90 via-[#1a0f0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-teal-900/20" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-h-[240px] sm:min-h-[320px]">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-gradient-to-r from-orange-500 to-coral-500 text-white font-bold border-orange-400/50 shadow-lg shadow-orange-500/20">
                <TrendingUp className="h-3 w-3 mr-1" /> Vibrant Community
              </Badge>
            </motion.div>
            {streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50 cursor-pointer">
                        <Flame className="h-3 w-3 mr-1" /> {streak} Day Streak
                        <Info className="h-3 w-3 ml-1 opacity-70" />
                      </Badge>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" className="max-w-[240px] text-center text-xs">
                    {t("wall.tooltip.streak")}
                  </PopoverContent>
                </Popover>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-orange-400/30 bg-[#1a0f0a]/50 backdrop-blur-lg rounded-xl px-5 py-4 w-fit max-w-full"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
              🌐 SOCIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-coral-400 to-teal-400">WALL</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-semibold mt-1 drop-shadow">
              Connect, share & grow with AI-powered social tools
            </p>
          </motion.div>
        </div>
      </motion.div>

      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((item, i) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.4 }}
                  className={`rounded-xl bg-gradient-to-br ${item.accent} bg-card/80 backdrop-blur-md border border-border/30 p-3 sm:p-4 text-center cursor-help`}
                >
                  <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.iconColor} mx-auto mb-1`} />
                  <p className="text-lg sm:text-2xl font-black">{item.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-center">
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
