import { motion } from "framer-motion";
import { Swords, Users, Trophy, Flame } from "lucide-react";
import heroVideo from "@/assets/horse-racing-hero-video.mp4.asset.json";

interface HorseRacingHeroProps {
  stats: {
    totalHorses: number;
    totalRaces: number;
    activeRaces: number;
    onlineTrainers: number;
  };
}

export const HorseRacingHero = ({ stats }: HorseRacingHeroProps) => {
  return (
    <div className="mb-8 space-y-3">
      {/* Video Section */}
      <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-black">
          <video
            autoPlay loop muted playsInline
            className="w-full h-full object-cover brightness-[1.4] saturate-[1.2]"
            src={heroVideo.url}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 leading-tight"
              style={{
                WebkitTextStroke: "2px rgba(0,0,0,0.6)",
                textShadow: "0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(245,158,11,0.4), 0 4px 20px rgba(0,0,0,0.9)",
                background: "linear-gradient(135deg, #a855f7, #ffffff, #f59e0b, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
              }}
            >
              🏇 Horse Racing Arena
            </h1>
            <p
              className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
            >
              Breed enchanted steeds, train legendary champions, and dominate the mystical tracks
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-1">
        {[
          { icon: Swords, label: "Horses", value: stats.totalHorses, gradient: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20" },
          { icon: Flame, label: "Races", value: stats.totalRaces, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
          { icon: Trophy, label: "Active Races", value: stats.activeRaces, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/20" },
          { icon: Users, label: "Trainers", value: stats.onlineTrainers, gradient: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 150 }}
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-card/90 backdrop-blur-xl p-3 shadow-lg ${stat.glow} hover:scale-105 transition-transform cursor-default`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
            <div className="relative flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-black text-base leading-tight">
                  {stat.value === 0 ? "—" : stat.value.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-[10px] font-medium">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
