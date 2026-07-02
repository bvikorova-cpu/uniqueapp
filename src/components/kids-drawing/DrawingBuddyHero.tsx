import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const floatingEmojis = ["🎨", "✏️", "🖌️", "🌈", "⭐", "🎭", "🖍️", "💫"];
const mascots = ["🎨", "🖌️", "✏️", "🖍️"];

export const DrawingBuddyHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Drawing Buddy Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Drawing Buddy Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drawing Buddy Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 md:p-12">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-3xl select-none pointer-events-none"
          style={{
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 17) % 60}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64">
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{ scale: 1 + ring * 0.3 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20 + ring * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-4">
        {/* Rotating mascot */}
        <motion.div
          className="text-6xl md:text-7xl mx-auto"
          animate={{
            rotateY: [0, 360],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.span
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎨
          </motion.span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          AI Drawing Buddy
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Learn to draw step by step with AI-powered tutorials, freestyle canvas, and fun challenges!
        </motion.p>

        {/* Mascot parade */}
        <motion.div
          className="flex justify-center gap-3 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {mascots.map((m, i) => (
            <motion.div
              key={i}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl md:text-2xl shadow-md"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              whileHover={{ scale: 1.2 }}
            >
              {m}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
