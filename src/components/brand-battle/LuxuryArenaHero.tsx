import { motion } from "framer-motion";
import { Crown, Zap, TrendingUp, Sparkles, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  totalVotes?: number;
  totalSponsors?: number;
  liveNow?: number;
}

export const LuxuryArenaHero = ({ totalVotes = 0, totalSponsors = 0, liveNow = 0 }: Props) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 mb-8">
      {/* Animated gold + cyber glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(45_95%_55%/.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_100%,hsl(280_85%_55%/.15),transparent_55%)]" />

      {/* Grid floor */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(hsl(45 95% 55% / .2) 1px, transparent 1px), linear-gradient(90deg, hsl(45 95% 55% / .2) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Spotlight beams */}
      <motion.div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-72 bg-gradient-to-b from-amber-400/20 to-transparent blur-3xl"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-300"
          style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative px-5 py-10 sm:px-10 sm:py-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-2 mb-5 flex-wrap"
        >
          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 border-0 font-black tracking-widest text-[10px] sm:text-xs px-3 py-1">
            <Crown className="h-3 w-3 mr-1" /> THE ARENA
          </Badge>
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-xs px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            {liveNow} LIVE BATTLES
          </Badge>
          <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40 text-[10px] sm:text-xs px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" /> AI POWERED
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4"
        >
          <span className="bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_hsl(45_95%_55%/.4)]">
            BRAND
          </span>{" "}
          <span className="bg-gradient-to-br from-violet-300 via-fuchsia-400 to-violet-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_hsl(280_85%_55%/.4)]">
            BATTLE
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-amber-100/70 text-sm sm:text-base max-w-2xl mx-auto mb-8"
        >
          Where global giants clash for dominance. Vote, invest, predict, and conquer in the world's
          most premium brand arena — powered by real-time AI intelligence.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto"
        >
          {[
            { icon: Flame, label: "Total Votes", value: totalVotes.toLocaleString(), color: "from-amber-400 to-yellow-600" },
            { icon: TrendingUp, label: "Brands", value: totalSponsors.toLocaleString(), color: "from-emerald-400 to-green-600" },
            { icon: Zap, label: "AI Insights", value: "24/7", color: "from-violet-400 to-fuchsia-600" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-amber-500/20 bg-zinc-950/60 backdrop-blur p-3 sm:p-4"
              >
                <div className={`inline-flex p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${s.color} mb-1.5`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-amber-100">{s.value}</div>
                <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-amber-100/50">
                  {s.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
