import { motion } from "framer-motion";
import { Crown, TrendingUp, Sparkles } from "lucide-react";

interface Props {
  totalVotes?: number;
  totalSponsors?: number;
  liveNow?: number;
}

export const LuxuryArenaHero = ({ totalVotes = 0, totalSponsors = 0, liveNow = 0 }: Props) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] mb-10 bg-black">
      {/* Deep black base with subtle gold radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45_85%_45%/.22),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(40_70%_30%/.18),transparent_55%)]" />

      {/* Fine gold grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(45 90% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(45 90% 60%) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />

      {/* Soft gold sweep */}
      <motion.div
        className="absolute -top-1/2 left-0 right-0 h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,hsl(45_85%_55%/.08)_60deg,transparent_120deg)]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Gold hairline border */}
      <div className="absolute inset-0 rounded-[2rem] border border-amber-500/20" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="relative px-6 py-14 sm:px-12 sm:py-20 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-7"
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/70" />
          <span className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-amber-300/90 font-medium">
            <Crown className="h-3 w-3" /> The Arena · Est. 2026
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/70" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl font-light tracking-tight leading-[0.95] mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <span className="block bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-transparent">
            Brand
          </span>
          <span className="block italic font-extralight bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-700 bg-clip-text text-transparent">
            Battle
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-amber-100/50 text-sm sm:text-base max-w-xl mx-auto mt-6 mb-10 font-light leading-relaxed"
        >
          Where the world's most ambitious brands compete for legacy.
          A premium arena of votes, predictions, and intelligence.
        </motion.p>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-amber-200/90 font-medium">
            {liveNow} Live Battles · Streaming Now
          </span>
        </motion.div>

        {/* Stat row — luxury divider style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 max-w-2xl mx-auto border-t border-amber-500/15 pt-8"
        >
          {[
            { label: "Total Votes", value: totalVotes.toLocaleString(), suffix: "" },
            { label: "Brands", value: totalSponsors.toLocaleString(), suffix: "" },
            { label: "AI Insights", value: "24", suffix: "/7" },
          ].map((s, i) => (
            <div
              key={i}
              className={`px-2 sm:px-4 ${i !== 2 ? "border-r border-amber-500/15" : ""}`}
            >
              <div className="font-serif text-2xl sm:text-4xl font-light bg-gradient-to-b from-amber-100 to-amber-500 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {s.value}<span className="text-amber-500/60">{s.suffix}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-amber-100/40 mt-1 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom ornaments */}
        <div className="flex items-center justify-center gap-2 mt-10 text-amber-500/40">
          <Sparkles className="h-3 w-3" />
          <span className="text-[10px] uppercase tracking-[0.4em]">Powered by Premium AI</span>
          <TrendingUp className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
};
