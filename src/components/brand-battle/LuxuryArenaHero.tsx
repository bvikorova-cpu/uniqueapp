import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  totalVotes?: number;
  totalSponsors?: number;
  liveNow?: number;
}

interface FightBrand {
  id: string;
  name: string;
  logo: string;
  total_votes: number;
  category: string;
}

export const LuxuryArenaHero = ({ totalVotes = 0, totalSponsors = 0, liveNow = 0 }: Props) => {
  const [topBrands, setTopBrands] = useState<FightBrand[]>([]);

  useEffect(() => {
    supabase
      .from("brand_sponsors")
      .select("id,name,logo,total_votes,category")
      .eq("subscription_status", "active")
      .order("total_votes", { ascending: false })
      .limit(2)
      .then(({ data }) => {
        if (data) setTopBrands(data as FightBrand[]);
      });
  }, []);

  const fighter1 = topBrands[0];
  const fighter2 = topBrands[1];

  return (
    <section className="relative overflow-hidden rounded-2xl mb-8 bg-[hsl(220_55%_5%)]">
      {/* Stadium light beams */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,hsl(215_85%_45%/.35),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_20%,hsl(0_75%_50%/.25),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(220_55%_3%)_85%)]" />

      {/* Search lights sweeping */}
      <motion.div
        className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-white/40 via-white/10 to-transparent origin-top"
        style={{ transformOrigin: "top center" }}
        animate={{ rotate: [-15, 15, -15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-white/40 via-white/10 to-transparent"
        style={{ transformOrigin: "top center" }}
        animate={{ rotate: [15, -15, 15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Crowd flash particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px bg-white rounded-full"
          style={{ left: `${(i * 47) % 100}%`, top: `${50 + (i * 13) % 40}%` }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            delay: (i * 0.7) % 5,
            repeatDelay: 3 + (i % 5),
          }}
        />
      ))}

      {/* Halftone arena texture */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative px-4 py-10 sm:px-8 sm:py-16">
        {/* Top — PPV badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">Live · PPV</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">
            Brand Battle · Main Event
          </span>
        </motion.div>

        {/* Fight Card */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-6 items-center max-w-5xl mx-auto mb-8">
          {/* Fighter 1 — Blue corner */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-right"
          >
            <div className="text-[9px] sm:text-[11px] font-black tracking-[0.3em] text-blue-400 uppercase mb-2">
              ◆ Blue Corner
            </div>
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <div className="text-right min-w-0">
                <div className="text-white font-black text-base sm:text-2xl uppercase tracking-tight leading-tight truncate">
                  {fighter1?.name || "Challenger"}
                </div>
                <div className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest mt-0.5">
                  {fighter1?.category || "—"}
                </div>
                <div className="text-blue-300 font-mono text-xs sm:text-sm mt-1 tabular-nums">
                  {fighter1?.total_votes?.toLocaleString() || "0"} <span className="text-slate-500">VOTES</span>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-blue-500/40 blur-lg rounded-xl" />
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-blue-400 bg-slate-900">
                  {fighter1?.logo?.startsWith("http") ? (
                    <img src={fighter1.logo} alt={fighter1.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl">
                      {fighter1?.logo || "?"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* VS center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
            <div className="relative font-black italic text-3xl sm:text-6xl text-white tracking-tighter [text-shadow:0_0_30px_rgba(255,255,255,0.5)]">
              VS
            </div>
          </motion.div>

          {/* Fighter 2 — Red corner */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-left"
          >
            <div className="text-[9px] sm:text-[11px] font-black tracking-[0.3em] text-red-400 uppercase mb-2">
              Red Corner ◆
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-red-500/40 blur-lg rounded-xl" />
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-red-400 bg-slate-900">
                  {fighter2?.logo?.startsWith("http") ? (
                    <img src={fighter2.logo} alt={fighter2.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl">
                      {fighter2?.logo || "?"}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-white font-black text-base sm:text-2xl uppercase tracking-tight leading-tight truncate">
                  {fighter2?.name || "Champion"}
                </div>
                <div className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest mt-0.5">
                  {fighter2?.category || "—"}
                </div>
                <div className="text-red-300 font-mono text-xs sm:text-sm mt-1 tabular-nums">
                  {fighter2?.total_votes?.toLocaleString() || "0"} <span className="text-slate-500">VOTES</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-black uppercase tracking-tighter leading-[0.85]">
            <span className="block text-4xl sm:text-7xl md:text-8xl text-white [text-shadow:0_0_40px_rgba(96,165,250,0.4)]">
              BRAND
            </span>
            <span className="block text-4xl sm:text-7xl md:text-8xl bg-gradient-to-r from-blue-300 via-white to-blue-300 bg-clip-text text-transparent italic">
              BATTLE
            </span>
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-slate-500" />
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-[0.4em] font-bold">
              Where Giants Collide
            </span>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-slate-500" />
          </div>
        </motion.div>

        {/* Live Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-px bg-slate-700/50 max-w-3xl mx-auto rounded overflow-hidden border border-slate-700"
        >
          {[
            { label: "Total Votes Cast", value: totalVotes.toLocaleString(), accent: "text-blue-300" },
            { label: "Active Fighters", value: totalSponsors.toLocaleString(), accent: "text-white" },
            { label: "Live Battles", value: liveNow.toString(), accent: "text-red-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-950/80 backdrop-blur px-3 py-3 sm:py-4">
              <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">
                {stat.label}
              </div>
              <div className={`font-mono text-lg sm:text-2xl font-black tabular-nums ${stat.accent}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom edge — broadcast bar */}
      <div className="relative bg-slate-950 border-t border-slate-800">
        <motion.div
          className="flex items-center gap-8 py-2 px-4 whitespace-nowrap text-[10px] uppercase tracking-widest font-bold"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {Array(2).fill(null).map((_, dup) => (
            <div key={dup} className="flex items-center gap-8">
              <span className="text-red-500">● LIVE</span>
              <span className="text-slate-400">BROADCASTING WORLDWIDE</span>
              <span className="text-blue-400">◆ AI POWERED</span>
              <span className="text-slate-400">REAL-TIME ODDS</span>
              <span className="text-white">★ PREMIUM EVENT</span>
              <span className="text-slate-400">SPONSORED MATCHUPS</span>
              <span className="text-red-500">● MAIN CARD</span>
              <span className="text-slate-400">BRAND BATTLE NETWORK</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
