import { motion } from "framer-motion";
import { Users, Swords, Trophy, Wifi } from "lucide-react";
import heroVideo from "@/assets/american-football-arena-hero.mp4.asset.json";

interface AFArenaHeroProps {
  stats: { totalPlayers: number; totalMatches: number; activeLeagues: number; onlineManagers: number };
  onNavigate: (view: string) => void;
}

export function AFArenaHero({ stats, onNavigate }: AFArenaHeroProps) {
  const statItems = [
    { icon: Users, label: "Players", value: stats.totalPlayers, color: "text-green-400" },
    { icon: Swords, label: "Games", value: stats.totalMatches, color: "text-red-400" },
    { icon: Trophy, label: "Leagues", value: stats.activeLeagues, color: "text-amber-400" },
    { icon: Wifi, label: "Online", value: stats.onlineManagers, color: "text-emerald-400" },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="relative h-[280px] md:h-[380px]">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.4) saturate(1.3)" }}>
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block border-2 border-green-500/60 rounded-xl px-4 py-2 mb-3 backdrop-blur-sm bg-black/30">
              <h1 className="text-2xl md:text-5xl font-black text-white" style={{ textShadow: "0 2px 20px rgba(34,197,94,0.5)" }}>
                🏈 American Football Arena
              </h1>
            </div>
            <p className="text-sm md:text-base text-white/80 max-w-lg font-medium" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
              Build your roster, dominate the gridiron, and win the championship
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-4 p-3 md:p-4 bg-card/50 backdrop-blur-xl border-t border-border/50">
        {statItems.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            className="text-center p-2 rounded-lg bg-background/50 border border-border/30">
            <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
            <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
