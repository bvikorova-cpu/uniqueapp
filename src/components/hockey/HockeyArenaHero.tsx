import { Suspense } from "react";
import { motion } from "framer-motion";
import { Users, Swords, Trophy, Wifi, Flame } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Stadium3D } from "@/components/arena/Stadium3D";

interface HockeyArenaHeroProps {
  stats: { totalPlayers: number; totalMatches: number; activeLeagues: number; onlineManagers: number };
  onNavigate: (view: string) => void;
}

export function HockeyArenaHero({ stats, onNavigate }: HockeyArenaHeroProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const statItems = [
    { icon: Users, label: "Players", value: stats.totalPlayers, color: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/30" },
    { icon: Swords, label: "Matches", value: stats.totalMatches, color: "from-red-400 to-rose-500", glow: "shadow-red-500/30" },
    { icon: Trophy, label: "Leagues", value: stats.activeLeagues, color: "from-amber-400 to-yellow-500", glow: "shadow-amber-500/30" },
    { icon: Wifi, label: "Online", value: stats.onlineManagers, color: "from-emerald-400 to-green-500", glow: "shadow-emerald-500/30" },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-900/20">
      <div className="relative h-[320px] md:h-[420px]">
        <div className="absolute inset-0">
          <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-cyan-950 via-blue-950 to-slate-950" />}>
            <Stadium3D sport="hockey" />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-transparent to-blue-900/20" />

        {/* Floating particles */}
        <motion.div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-cyan-400/60 blur-[1px]"
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-blue-400/50 blur-[1px]"
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />

        {/* LIVE badge */}
        <motion.div className="absolute top-4 right-4 z-20" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/90 backdrop-blur-md border border-red-400/30">
            <motion.div className="w-2 h-2 rounded-full bg-white" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live</span>
          </div>
        </motion.div>

        <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div className="inline-flex items-center gap-2 mb-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30">
                <Flame className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-bold text-cyan-300 tracking-widest uppercase">Season Active</span>
              </div>
            </motion.div>
            <div className="relative mb-2">
              <h1 className="text-3xl md:text-6xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">Hockey</span>
                <br />
                <span className="text-white/95" style={{ textShadow: "0 2px 30px rgba(6,182,212,0.4)" }}>Arena</span>
              </h1>
              <motion.div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-blue-400 to-transparent rounded-full"
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
            </div>
            <p className="text-sm md:text-base text-white/70 max-w-md font-medium leading-relaxed">
              Build your roster, dominate the ice, and hoist the championship trophy
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-t border-cyan-500/10">
        {statItems.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}
            className={`text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300 shadow-lg ${stat.glow}`}>
            <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-lg md:text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
