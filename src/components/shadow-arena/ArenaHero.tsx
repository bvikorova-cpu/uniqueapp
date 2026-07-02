import { motion } from "framer-motion";
import { Ghost, Skull, Eye } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const fogParticles = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${20 + Math.random() * 60}%`,
  size: 40 + Math.random() * 80,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 4,
}));

export function ArenaHero() {
  return (
    <>
      <FloatingHowItWorks title={"Arena Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Arena Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Arena Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(0,20%,5%)] via-[hsl(280,30%,8%)] to-[hsl(0,0%,3%)] p-8 md:p-14 text-center mb-8">
      {/* Atmospheric fog */}
      {fogParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-red-900/10 blur-2xl pointer-events-none"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ x: [-20, 20, -20], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/20 rounded-full blur-[100px]" />

      {/* Pulsing beacon */}
      <motion.div
        className="relative z-10 mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center shadow-[0_0_40px_rgba(127,29,29,0.6)]"
        animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 40px rgba(127,29,29,0.6)", "0 0 60px rgba(127,29,29,0.9)", "0 0 40px rgba(127,29,29,0.6)"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Ghost className="w-9 h-9 text-red-200" />
      </motion.div>

      {/* Glitch title */}
      <motion.h1
        className="relative z-10 text-4xl md:text-6xl font-black mb-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.span
          className="bg-gradient-to-r from-red-500 via-red-400 to-purple-400 bg-clip-text text-transparent inline-block"
          animate={{ skewX: [0, -2, 0, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          Shadow Arena
        </motion.span>
      </motion.h1>

      <motion.p
        className="relative z-10 text-lg text-red-200/70 max-w-lg mx-auto mb-6 font-serif italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Where Terror Meets Glory in Live Horror Battles
      </motion.p>

      {/* Feature pills */}
      <motion.div
        className="relative z-10 flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { icon: Skull, label: "Live Streaming Battles" },
          { icon: Eye, label: "AI Horror Illustrations" },
          { icon: Ghost, label: "Cash Prizes" },
        ].map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/40 border border-red-800/30 text-sm text-red-200/80 backdrop-blur-sm"
          >
            <tag.icon className="w-4 h-4" />
            {tag.label}
          </span>
        ))}
      </motion.div>
    </section>
    </>
  );
}
