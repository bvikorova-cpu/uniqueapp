import { motion } from "framer-motion";
import { Users, Swords, Trophy, Wifi } from "lucide-react";
import heroVideo from "@/assets/basketball-arena-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BasketballArenaHeroProps {
  stats: { totalPlayers: number; totalMatches: number; activeLeagues: number; onlineManagers: number };
  onNavigate: (view: string) => void;
}

export function BasketballArenaHero({ stats }: BasketballArenaHeroProps) {
  const statItems = [
    { icon: Users, label: "Players", value: stats.totalPlayers, accent: "#f97316" },
    { icon: Swords, label: "Matches", value: stats.totalMatches, accent: "#ef4444" },
    { icon: Trophy, label: "Leagues", value: stats.activeLeagues, accent: "#eab308" },
    { icon: Wifi, label: "Online", value: stats.onlineManagers, accent: "#10b981" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Basketball Arena Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Basketball Arena Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Basketball Arena Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[340px] md:h-[420px] rounded-2xl overflow-hidden mb-8">
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/90 backdrop-blur-md border border-red-400/30">
          <motion.div className="w-2 h-2 rounded-full bg-white" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live</span>
        </div>
      </motion.div>

      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-3xl md:text-5xl font-black mb-2"
          style={{
            WebkitTextStroke: "1.5px rgba(0,0,0,0.3)",
            textShadow: "0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(249,115,22,0.3)",
            background: "linear-gradient(135deg, #f97316, #fb923c, #fdba74)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🏀 Basketball Arena
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-sm md:text-base text-white/90 max-w-xl mb-4 font-semibold"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          Build your dream team, dominate the court, and become a basketball legend
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {statItems.map((s, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.accent }} />
              <div className="text-xl md:text-2xl font-black" style={{ color: s.accent }}>{s.value}</div>
              <div className="text-[10px] md:text-xs text-white/70 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
}
