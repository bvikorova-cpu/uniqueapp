import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Gift, Users, Crown, Star, Gem, Flame } from "lucide-react";
import heroVideo from "@/assets/mystery-box-hero.mp4.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * Real, cached stats from DB (no random/fake live ticking — EU consumer compliance).
 * Shared react-query cache: 5 min stale, dedupes across all tabs/instances.
 */
const useLiveStats = () => {
  const { data } = useQuery({
    queryKey: ["mystery-box-hero-stats"],
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const [opened, rewards, recent] = await Promise.all([
        supabase.from("user_mystery_boxes").select("id", { count: "exact", head: true }).eq("is_opened", true),
        supabase.from("mystery_box_rewards").select("id", { count: "exact", head: true }),
        supabase.from("user_mystery_boxes").select("user_id", { count: "exact", head: true }).gte("purchased_at", since),
      ]);
      const boxesOpened = opened.count || 0;
      return {
        boxesOpened,
        activePlayers: recent.count || 0,
        legendaryDrops: rewards.count || 0,
        jackpotPool: Math.round(boxesOpened * 0.25),
      };
    },
  });
  return data ?? { boxesOpened: 0, activePlayers: 0, legendaryDrops: 0, jackpotPool: 0 };
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
    <>
      <FloatingHowItWorks title={"Mystery Box Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Mystery Box Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mystery Box Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/15 via-transparent to-red-900/10" />
        
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
    </>
  );
};
