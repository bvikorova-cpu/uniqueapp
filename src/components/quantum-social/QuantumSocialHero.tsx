import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Atom, Users, Eye, Zap } from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/quantum-social-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const statQueries = [
  { key: "profiles", table: "quantum_profiles" },
  { key: "posts", table: "quantum_posts" },
  { key: "entanglements", table: "quantum_entanglements" },
  { key: "observations", table: "quantum_observations" },
];

export function QuantumSocialHero() {
  const { stats, loading } = useLiveStats(statQueries);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ["#06b6d4", "#8b5cf6", "#10b981", "#ec4899"];
    const p = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      color: colors[i % colors.length],
    }));
    setParticles(p);
  }, []);

  const heroStats = [
    { label: "Quantum Profiles", value: stats.profiles || 0, icon: Users, color: "text-cyan-400" },
    { label: "Quantum Posts", value: stats.posts || 0, icon: Atom, color: "text-violet-400" },
    { label: "Entanglements", value: stats.entanglements || 0, icon: Zap, color: "text-emerald-400" },
    { label: "Observations", value: stats.observations || 0, icon: Eye, color: "text-pink-400" },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 420 }}>
      <FloatingHowItWorks
        title={"Quantum Social Hero"}
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
        style={{ filter: "brightness(0.7) saturate(1.4)" }}
      />

      {/* Neon Matrix Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Matrix rain effect */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.1) 2px, rgba(6,182,212,0.1) 4px)`,
        backgroundSize: '100% 4px',
        animation: 'pulse 4s ease-in-out infinite',
      }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4,
            height: 4,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.9, 0.2],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 3.5,
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 backdrop-blur-sm mb-4">
            <Atom className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-sm font-medium text-cyan-300">Quantum Social Network</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 inline-block px-6 py-2 rounded-2xl border-2 border-cyan-400/40 bg-black/30 backdrop-blur-sm"
          style={{ textShadow: "0 0 30px rgba(6,182,212,0.5), 0 2px 20px rgba(0,0,0,0.8)", color: "white" }}
        >
          Your Reality.{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Infinite Versions.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base md:text-lg font-semibold text-white/90 max-w-2xl mb-8"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
        >
          Posts exist in quantum superposition — each viewer sees a different reality until observed
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
              className="rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-md px-3 py-3"
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
