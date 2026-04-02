import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Users, Crown, Star, Gem, Flame } from "lucide-react";
import heroVideo from "@/assets/mystery-box-hero.mp4.asset.json";

const useLiveStats = () => {
  const [stats, setStats] = useState({
    boxesOpened: 184320,
    activePlayers: 12450,
    legendaryDrops: 2891,
    jackpotPool: 47580,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        boxesOpened: prev.boxesOpened + Math.floor(Math.random() * 8),
        activePlayers: prev.activePlayers + (Math.random() > 0.5 ? 1 : -1),
        legendaryDrops: prev.legendaryDrops + (Math.random() > 0.92 ? 1 : 0),
        jackpotPool: prev.jackpotPool + Math.floor(Math.random() * 15),
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

export const MysteryBoxHero = () => {
  const stats = useLiveStats();

  const statItems = [
    { icon: Gift, label: "Boxes Opened", value: stats.boxesOpened.toLocaleString(), glow: "shadow-yellow-500/30" },
    { icon: Users, label: "Active Players", value: stats.activePlayers.toLocaleString(), glow: "shadow-emerald-500/30" },
    { icon: Crown, label: "Legendary Drops", value: stats.legendaryDrops.toLocaleString(), glow: "shadow-purple-500/30" },
    { icon: Gem, label: "Jackpot Pool", value: `${stats.jackpotPool.toLocaleString()}`, glow: "shadow-red-500/30" },
  ];

  return (
    <div className="mb-8">
      {/* Video Hero */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden rounded-2xl border border-yellow-500/30 shadow-[0_0_60px_rgba(255,215,0,0.12)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.75] saturate-[1.2]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/30 via-transparent to-red-900/20" />
        
        {/* Animated gold particle overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          background: "radial-gradient(circle at 30% 40%, rgba(255,215,0,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,165,0,0.2) 0%, transparent 50%)"
        }} />

        {/* Luxury corner frames */}
        <div className="absolute top-3 left-3 w-16 h-16 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-2xl" />
        <div className="absolute top-3 right-3 w-16 h-16 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-2xl" />
        <div className="absolute bottom-3 left-3 w-16 h-16 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-2xl" />
        <div className="absolute bottom-3 right-3 w-16 h-16 border-b-2 border-r-2 border-yellow-500/50 rounded-br-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-amber-400/90 text-xs font-bold tracking-[0.4em] uppercase border border-amber-500/30 px-4 py-1 rounded-full bg-amber-500/10 backdrop-blur-sm">
                The Vault
              </span>
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
            </motion.div>

            <h1
              className="text-4xl md:text-7xl font-black mb-3 leading-tight"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFF8DC 25%, #FFD700 50%, #B8860B 75%, #FFF8DC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 30px rgba(255,215,0,0.4))",
              }}
            >
              Mystery Box
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/60 text-xs md:text-sm max-w-xl mx-auto font-light tracking-wide"
            >
              Premium Gacha Casino — Unlock Legendary Rewards
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid BELOW video */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 250 }}
            whileHover={{ scale: 1.07, y: -6 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-card/90 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4 text-center shadow-lg ${stat.glow} hover:border-yellow-500/40 transition-all cursor-default`}
          >
            <stat.icon className="h-5 w-5 mx-auto mb-1.5 text-yellow-400" />
            <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
