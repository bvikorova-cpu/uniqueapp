import { motion } from "framer-motion";
import { Heart, Gamepad2, Trophy, Sparkles } from "lucide-react";
import heroVideo from "@/assets/virtual-pet-hero-v4.mp4.asset.json";

const stats = [
  { icon: Heart, label: "Active Pets", value: "12K+", color: "text-pink-400" },
  { icon: Gamepad2, label: "Games Played", value: "89K", color: "text-cyan-400" },
  { icon: Trophy, label: "Battles Won", value: "34K", color: "text-amber-400" },
  { icon: Sparkles, label: "Evolutions", value: "7.2K", color: "text-emerald-400" },
];

export const VirtualPetHero = () => (
  <div className="mb-8">
    {/* Video Section */}
    <div className="relative rounded-2xl overflow-hidden h-[300px] md:h-[380px]">
      <div className="absolute inset-0 bg-black">
        <video
          autoPlay muted loop playsInline
          className="w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
      </div>

      {/* Title only - top area */}
      <div className="relative z-10 h-full flex flex-col justify-start p-4 md:p-8 pt-6 md:pt-10">
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
          className="text-sm md:text-base text-white/90 max-w-xl drop-shadow-lg"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          Adopt, raise, battle & evolve your AI-powered companions. Play mini-games, breed rare pets, and trade with other masters!
        </motion.p>
      </div>
    </div>

    {/* Stats Row - below video */}
    <div className="grid grid-cols-4 gap-2 mt-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
          className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-2.5 flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div>
            <p className="font-black text-sm">{stat.value}</p>
            <p className="text-muted-foreground text-[10px]">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
