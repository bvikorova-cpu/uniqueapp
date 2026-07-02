import { motion } from "framer-motion";
import { Swords, Users, Trophy, Flame } from "lucide-react";
import heroVideo from "@/assets/character-arena-hero-v3.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CharacterArenaHeroProps {
  stats: {
    totalCharacters: number;
    totalBattles: number;
    activeTournaments: number;
    onlineWarriors: number;
  };
}

export const CharacterArenaHero = ({ stats }: CharacterArenaHeroProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Character Arena Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Arena Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Arena Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-3">
      {/* Video Section */}
      <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
            src={heroVideo.url}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>

        {/* Title overlay - positioned at top for full visibility */}
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
                textShadow: "0 0 40px rgba(245,158,11,0.6), 0 0 80px rgba(220,38,38,0.4), 0 4px 20px rgba(0,0,0,0.9)",
                background: "linear-gradient(135deg, #f59e0b, #ffffff, #ef4444, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
              }}
            >
              ⚔️ Character Creator Arena
            </h1>
            <p
              className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
            >
              Forge legendary warriors, battle for glory, and conquer the arena
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Row - BELOW the video */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-1">
        {[
          { icon: Swords, label: "Characters", value: stats.totalCharacters, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
          { icon: Flame, label: "Battles", value: stats.totalBattles, gradient: "from-red-500 to-rose-600", glow: "shadow-red-500/20" },
          { icon: Trophy, label: "Tournaments", value: stats.activeTournaments, gradient: "from-yellow-500 to-amber-600", glow: "shadow-yellow-500/20" },
          { icon: Users, label: "Warriors", value: stats.onlineWarriors, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 150 }}
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-card/90 backdrop-blur-xl p-3 shadow-lg ${stat.glow} hover:scale-105 transition-transform cursor-default`}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            {/* Subtle glow */}
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
    </>
  );
};
