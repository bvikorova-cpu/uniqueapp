import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, TrendingUp, Zap, Users } from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/emotion-economy-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const statQueries = [
  { key: "traders", table: "emotion_wallets" },
  { key: "mined", table: "emotion_mining_activities" },
  { key: "listings", table: "emotion_market_listings" },
  { key: "posts", table: "emotion_posts" },
];

export function EmotionEconomyHero() {
  const { stats, loading } = useLiveStats(statQueries);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981"];
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      color: colors[i % colors.length],
    }));
    setParticles(p);
  }, []);

  const heroStats = [
    { label: "Active Traders", value: stats.traders || 0, icon: Users, color: "text-pink-400" },
    { label: "Emotions Mined", value: stats.mined || 0, icon: Zap, color: "text-violet-400" },
    { label: "Market Listings", value: stats.listings || 0, icon: TrendingUp, color: "text-cyan-400" },
    { label: "Posts Created", value: stats.posts || 0, icon: Heart, color: "text-emerald-400" },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 420 }}>
      <FloatingHowItWorks
        title={"Emotion Economy Hero"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* Video Background */}
      <video
        src={heroVideo.url}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.3)" }}
      />

      {/* Soft warm aurora overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/15 via-violet-300/10 to-cyan-300/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10" />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 6,
            height: 6,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 12px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 md:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 backdrop-blur-sm mb-4">
            <Heart className="h-4 w-4 text-pink-400 animate-pulse" />
            <span className="text-sm font-medium text-pink-300">Emotion Economy Network</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 inline-block px-6 py-2 rounded-2xl border-2 border-white/40 bg-white/10 backdrop-blur-sm"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)", color: "white" }}
        >
          Trade Emotions.{" "}
          <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Earn Real Value.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base md:text-lg font-semibold text-white/90 max-w-2xl mb-8"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
        >
          Buy joy, sell sadness, mine motivation — the world's first emotional marketplace powered by AI
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
        >
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-3"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-xl md:text-2xl font-bold text-white">
                {loading ? "—" : stat.value || "—"}
              </p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
