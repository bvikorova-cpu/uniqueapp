import { motion } from "framer-motion";
import { Heart, Gamepad2, Trophy, Sparkles } from "lucide-react";
import heroVideo from "@/assets/virtual-pet-hero-v3.mp4.asset.json";

const stats = [
  { icon: Heart, label: "Active Pets", value: "12K+", color: "text-pink-400" },
  { icon: Gamepad2, label: "Games Played", value: "89K", color: "text-cyan-400" },
  { icon: Trophy, label: "Battles Won", value: "34K", color: "text-amber-400" },
  { icon: Sparkles, label: "Evolutions", value: "7.2K", color: "text-emerald-400" },
];

export const VirtualPetHero = () => (
  <div className="relative rounded-2xl overflow-hidden mb-8 h-[380px] md:h-[440px]">
    {/* Video Background */}
    <div className="absolute inset-0 bg-black">
      <video
        autoPlay muted loop playsInline
        className="w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
    </div>

    {/* Content */}
    <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-3xl md:text-5xl font-black mb-2"
        style={{
          WebkitTextStroke: "2.5px rgba(0,0,0,0.7)",
          background: "linear-gradient(135deg, #fff, #f0abfc, #c084fc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 30px rgba(192,132,252,0.6), 0 0 60px rgba(192,132,252,0.3), 0 4px 20px rgba(0,0,0,0.7)",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))",
          letterSpacing: "-0.02em",
        }}
      >
        Virtual Pet Companion
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm md:text-base text-white/80 mb-4 max-w-xl drop-shadow-md"
      >
        Adopt, raise, battle & evolve your AI-powered companions. Play mini-games, breed rare pets, and trade with other masters!
      </motion.p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2.5 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-white font-black text-sm">{stat.value}</p>
              <p className="text-white/60 text-[10px]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
