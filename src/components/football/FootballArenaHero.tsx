import { Suspense } from "react";
import { motion } from "framer-motion";
import { Users, Swords, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Stadium3D } from "@/components/arena/Stadium3D";

interface FootballArenaHeroProps {
  stats: { totalPlayers: number; totalMatches: number; activeLeagues: number; onlineManagers: number };
  onNavigate: (view: string) => void;
}

const statItems = [
  { icon: Users, label: "Players", color: "text-emerald-400", key: "totalPlayers" as const },
  { icon: Swords, label: "Matches", color: "text-red-400", key: "totalMatches" as const },
  { icon: Trophy, label: "Active Leagues", color: "text-amber-400", key: "activeLeagues" as const },
  { icon: Target, label: "Managers Online", color: "text-cyan-400", key: "onlineManagers" as const },
];

export const FootballArenaHero = ({ stats, onNavigate }: FootballArenaHeroProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  return (
    <section className="relative h-[70svh] min-h-[480px] overflow-hidden rounded-2xl mx-2 md:mx-0 bg-slate-950">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-emerald-950 to-slate-950" />}>
          <Stadium3D sport="football" />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent pointer-events-none" />

      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-emerald-400/40 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-emerald-400/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-emerald-400/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-emerald-400/40 rounded-br-lg" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-10 pb-6 md:pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-emerald-500/15 backdrop-blur-sm rounded-full border border-emerald-400/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-mono text-xs uppercase tracking-[0.2em]">Football Command Center</span>
          </div>
          <h1 className="text-[clamp(2.2rem,11vw,4.5rem)] font-black font-mono leading-[1.05] mb-3 max-w-[20ch]" style={{ background: 'linear-gradient(135deg, #fff 0%, #10b981 50%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚽ Football Arena
          </h1>
          <p className="text-emerald-100/70 text-sm md:text-lg max-w-xl mb-6 leading-relaxed font-mono">
            Build your dream team. Dominate the league. Claim glory.
          </p>
          <div className="flex gap-3 mb-6">
            <Button onClick={() => onNavigate("team-builder")} size={isMobile ? "default" : "lg"} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-mono uppercase tracking-wider border border-emerald-400/30 shadow-lg shadow-emerald-500/30">
              ⚽ Enter Arena
            </Button>
            {!user && (
              <Button onClick={() => navigate("/auth")} variant="outline" size={isMobile ? "default" : "lg"} className="border-emerald-400/30 text-emerald-300 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-sm font-mono uppercase tracking-wider">
                Sign In
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {statItems.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/60 backdrop-blur-md border border-emerald-500/20">
              <div className="relative">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div className={`absolute -inset-2 rounded-full blur-md opacity-30 ${stat.color.replace('text-', 'bg-')}`} />
              </div>
              <div>
                <p className="font-mono font-bold text-white text-sm md:text-lg">{stats[stat.key] === 0 ? "—" : stats[stat.key].toLocaleString()}</p>
                <p className="text-[10px] font-mono text-emerald-400/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
