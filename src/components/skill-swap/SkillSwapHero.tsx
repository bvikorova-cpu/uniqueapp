import { motion } from "framer-motion";
import { ArrowLeftRight, Users, Star, MessageSquare } from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/skill-swap-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SkillSwapHero = () => {
  const { stats: liveStats, loading } = useLiveStats([
    { key: "swappers", table: "skill_swap_profiles" },
    { key: "exchanges", table: "skill_swap_matches" },
    { key: "messages", table: "skill_swap_messages" },
  ]);

  const stats = [
    { icon: Users, label: "Active Swappers", value: liveStats.swappers },
    { icon: ArrowLeftRight, label: "Exchanges Done", value: liveStats.exchanges },
    { icon: Star, label: "Avg. Rating", value: null },
    { icon: MessageSquare, label: "Conversations", value: liveStats.messages },
  ];

  const formatValue = (val: number | null | undefined) => {
    if (loading) return "—";
    if (val === null || val === undefined || val === 0) return "—";
    return val.toLocaleString();
  };

  return (
    <>
      <FloatingHowItWorks title={"Skill Swap Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Swap Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Swap Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-3xl overflow-hidden mb-8 sm:mb-12"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: "brightness(1.1) saturate(1.2)" }}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-orange-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 sm:py-16 lg:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white mb-4"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="font-medium">Global Skill Exchange Platform</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-block mb-3"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white px-6 py-3 rounded-2xl bg-black/20 backdrop-blur-lg border-2 border-white/10"
            style={{ textShadow: "0 2px 20px rgba(251,146,60,0.4), 0 0 40px rgba(251,146,60,0.2)" }}
          >
            ⚡ GLOBAL SKILL SWAP ⚡
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/90 text-sm sm:text-lg max-w-2xl mx-auto mb-8 font-semibold"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          Exchange skills with people worldwide — no money needed. Teach what you know, learn what you love.
        </motion.p>

        {/* Glassmorphic Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="relative group p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all"
            >
              <stat.icon className="w-5 h-5 text-amber-300 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-white">
                {formatValue(stat.value)}
              </div>
              <p className="text-[11px] text-white/70 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};
