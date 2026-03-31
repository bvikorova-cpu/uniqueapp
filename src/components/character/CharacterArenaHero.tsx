import { motion } from "framer-motion";
import { Swords, Users, Trophy, Flame } from "lucide-react";
import heroVideo from "@/assets/character-arena-hero.mp4.asset.json";

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
    <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden rounded-2xl mb-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.15]"
        poster=""
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black mb-2"
            style={{
              WebkitTextStroke: "1.5px rgba(0,0,0,0.3)",
              textShadow: "0 0 40px rgba(245,158,11,0.5), 0 4px 20px rgba(0,0,0,0.8)",
              background: "linear-gradient(135deg, #f59e0b, #ffffff, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ⚔️ Character Creator Arena
          </h1>
          <p
            className="text-sm sm:text-lg text-white/90 max-w-2xl mb-6"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            Forge legendary warriors, battle for glory, and conquer the arena
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[
            { icon: Swords, label: "Characters", value: stats.totalCharacters, color: "from-amber-500 to-orange-600" },
            { icon: Flame, label: "Battles", value: stats.totalBattles, color: "from-red-500 to-rose-600" },
            { icon: Trophy, label: "Tournaments", value: stats.activeTournaments, color: "from-yellow-500 to-amber-600" },
            { icon: Users, label: "Warriors", value: stats.onlineWarriors, color: "from-emerald-500 to-green-600" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
              className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-white/60 text-[10px] sm:text-xs truncate">{stat.label}</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-white">{stat.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
