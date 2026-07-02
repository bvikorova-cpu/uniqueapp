import { motion } from "framer-motion";
import { Sparkles, Wand2, Star } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function WizardHero() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <>
      <FloatingHowItWorks title={"Wizard Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Wizard Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wizard Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-8 md:p-12 mb-8 shadow-2xl">
      {/* Animated particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-yellow-300/60 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.id % 3 === 0 ? "✨" : p.id % 3 === 1 ? "⭐" : "🌟"}
        </motion.div>
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-pink-500/20 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 text-center">
        {/* Floating icons */}
        <div className="flex justify-center gap-4 mb-4">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Wand2 className="h-10 w-10 text-yellow-300" />
          </motion.div>
          <motion.div
            animate={{ y: [-10, 0, -10], scale: [1, 1.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Sparkles className="h-12 w-12 text-pink-300" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="h-10 w-10 text-cyan-300" />
          </motion.div>
        </div>

        <motion.h1
          className="text-4xl md:text-6xl font-black text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
            Character Workshop
          </span>{" "}
          🧙‍♂️
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Design your ultimate hero with magical powers, unique looks, and an epic backstory!
        </motion.p>

        {/* Stats bar */}
        <motion.div
          className="flex justify-center gap-6 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: "Powers", icon: "⚡", count: "6+" },
            { label: "Styles", icon: "🎨", count: "42+" },
            { label: "Stories", icon: "📖", count: "∞" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-white font-bold text-lg">{stat.count}</p>
              <p className="text-purple-200 text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
}
