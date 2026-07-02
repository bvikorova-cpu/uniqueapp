import { motion } from 'framer-motion';
import { Film, Sparkles, Star } from 'lucide-react';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CinematicHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Cinematic Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Cinematic Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cinematic Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 p-8 md:p-12">
      {/* Film strip borders */}
      <div className="absolute top-0 left-0 right-0 h-8 flex gap-1 px-2 items-center opacity-30">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-4 h-5 rounded-sm bg-white/40 flex-shrink-0" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 flex gap-1 px-2 items-center opacity-30">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-4 h-5 rounded-sm bg-white/40 flex-shrink-0" />
        ))}
      </div>

      {/* Floating sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {i % 3 === 0 ? (
            <Star className="w-3 h-3 text-amber-300" fill="currentColor" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-300" />
          )}
        </motion.div>
      ))}

      {/* Countdown circle */}
      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-24 h-24 rounded-full border-4 border-dashed border-amber-400/30" />
      </motion.div>

      <div className="relative z-10 text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold border border-amber-400/30"
        >
          <Film className="w-4 h-4" />
          AI-Powered Story Studio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent"
        >
          Story Video Creator
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-purple-200 text-lg max-w-xl mx-auto"
        >
          Transform your imagination into magical animated stories with AI-generated art, narration & music
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 text-sm text-purple-300"
        >
          {['✍️ AI Writing', '🎨 AI Art', '🎙️ AI Narration', '🎬 Export'].map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-1"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
