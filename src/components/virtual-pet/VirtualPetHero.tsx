import { motion } from "framer-motion";
import { Heart, Gamepad2, Trophy, Sparkles } from "lucide-react";
import heroVideo from "@/assets/virtual-pet-hero-v6.mp4.asset.json";

const stats = [
  { icon: Heart, label: "Active Pets", value: "12K+", gradient: "from-pink-500 to-rose-400", glow: "shadow-pink-500/30" },
  { icon: Gamepad2, label: "Games Played", value: "89K", gradient: "from-cyan-500 to-blue-400", glow: "shadow-cyan-500/30" },
  { icon: Trophy, label: "Battles Won", value: "34K", gradient: "from-amber-500 to-yellow-400", glow: "shadow-amber-500/30" },
  { icon: Sparkles, label: "Evolutions", value: "7.2K", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/30" },
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

      <div className="relative z-10 h-full flex flex-col justify-start p-4 md:p-8 pt-6 md:pt-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-3xl md:text-5xl font-black mb-2"
          style={ {
            WebkitTextStroke: "2.5px rgba(0,0,0,0.7)",
            background: "linear-gradient(135deg, #fff, #f0abfc, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 30px rgba(192,132,252,0.6), 0 0 60px rgba(192,132,252,0.3), 0 4px 20px rgba(0,0,0,0.7)",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))",
            letterSpacing: "-0.02em" }}
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

    {/* Stats Row - styled cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 -mt-6 relative z-20 px-2">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 150 }}
          className={`relative overflow-hidden rounded-xl border border-white/10 bg-card/90 backdrop-blur-xl p-3 shadow-lg ${stat.glow} hover:scale-105 transition-transform cursor-default`}
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
          {/* Subtle glow background */}
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />

          <div className="relative flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
              <stat.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="font-black text-base leading-tight">{stat.value}</p>
              <p className="text-muted-foreground text-[10px] font-medium">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
