import { motion } from "framer-motion";
import heroVideo from "@/assets/lie-detector-eye-hero.mp4.asset.json";
import poster from "@/assets/lie-detector-eye-poster.jpg";
import { Eye, Lock, Activity } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const LieDetectorCinematicHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Cinematic Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Cinematic Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Cinematic Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full rounded-2xl overflow-hidden border border-red-900/40 shadow-[0_0_60px_-15px_hsl(0_70%_40%/0.5)]">
      {/* Background video */}
      <video
        src={heroVideo.url}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-[260px] sm:h-[340px] md:h-[420px] object-cover"
      />

      {/* Scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,30,30,0.04) 0px, rgba(255,30,30,0.04) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Vignette + film grain */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.7)_100%)]" />

      {/* HUD chips */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-950/70 border border-red-500/40 backdrop-blur-md"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-red-200">REC • LIVE SCAN</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-950/70 border border-amber-500/40 backdrop-blur-md"
      >
        <Lock className="w-3 h-3 text-amber-300" />
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-200">CASE #LD-2026</span>
      </motion.div>

      {/* Center title */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 backdrop-blur-md mb-2"
        >
          <Eye className="w-3.5 h-3.5 text-red-300" />
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-red-100">
            Forensic AI Truth Engine
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-red-100 to-red-300 drop-shadow-[0_2px_20px_rgba(255,40,40,0.6)]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          LIE DETECTOR
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-2 text-xs sm:text-sm text-red-50/85 max-w-xl font-mono"
        >
          Voice • Text • Screenshot • Timeline — uncover deception with forensic-grade AI.
        </motion.p>

        {/* Pulse waveform mini bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 border border-red-500/30 backdrop-blur-md"
        >
          <Activity className="w-3 h-3 text-red-400" />
          {[3, 6, 4, 8, 5, 9, 4, 7, 3, 6].map((h, i) => (
            <motion.span
              key={i}
              className="w-[2px] bg-red-400 rounded-full"
              animate={{ height: [`${h * 1.5}px`, `${(11 - h) * 2}px`, `${h * 1.5}px`] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
