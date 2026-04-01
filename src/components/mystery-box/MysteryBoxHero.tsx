import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Users, Crown, Star } from "lucide-react";
import heroVideo from "@/assets/mystery-box-hero.mp4.asset.json";

const useLiveStats = () => {
  const [stats, setStats] = useState({
    boxesOpened: 184320,
    activePlayers: 12450,
    legendaryDrops: 2891,
    satisfaction: 4.8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        boxesOpened: prev.boxesOpened + Math.floor(Math.random() * 5),
        activePlayers: prev.activePlayers + (Math.random() > 0.6 ? 1 : 0),
        legendaryDrops: prev.legendaryDrops + (Math.random() > 0.9 ? 1 : 0),
        satisfaction: prev.satisfaction,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

export const MysteryBoxHero = () => {
  const stats = useLiveStats();

  const statItems = [
    { icon: Gift, label: "Boxes Opened", value: stats.boxesOpened.toLocaleString() },
    { icon: Users, label: "Active Players", value: stats.activePlayers.toLocaleString() },
    { icon: Crown, label: "Legendary Drops", value: stats.legendaryDrops.toLocaleString() },
    { icon: Star, label: "Player Rating", value: stats.satisfaction.toFixed(1) },
  ];

  return (
    <div className="mb-8">
      {/* Video Hero */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden rounded-2xl border border-yellow-500/20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 via-transparent to-yellow-900/20" />

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-yellow-500/40 rounded-tl-xl" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-yellow-500/40 rounded-tr-xl" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-yellow-500/40 rounded-bl-xl" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-yellow-500/40 rounded-br-xl" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400/90 text-sm font-semibold tracking-[0.3em] uppercase">The Vault</span>
              <Crown className="h-5 w-5 text-yellow-400" />
            </motion.div>

            <h1
              className="text-5xl md:text-7xl font-black mb-3 leading-tight"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFF8DC 30%, #FFD700 50%, #B8860B 70%, #FFF8DC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "1.5px rgba(255,215,0,0.2)",
                textShadow: "0 0 60px rgba(255,215,0,0.5)",
                filter: "drop-shadow(0 0 20px rgba(255,215,0,0.3))",
              }}
            >
              Mystery Box
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/70 text-sm md:text-base max-w-2xl mx-auto font-light tracking-wide"
            >
              Unlock the Unknown — Premium Gacha-Style Rewards Await
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid BELOW video */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="bg-card/80 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4 text-center shadow-[0_0_15px_rgba(255,215,0,0.06)] hover:shadow-[0_0_25px_rgba(255,215,0,0.12)] transition-shadow"
          >
            <stat.icon className="h-5 w-5 mx-auto mb-1.5 text-yellow-400" />
            <p className="text-2xl md:text-3xl font-black">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
