import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const floatingEmojis = ["📖", "🔤", "✨", "🧠", "📚", "🎯", "💡", "⭐"];

export const ReadingHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Reading Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Reading Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reading Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-8 mb-8">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-3xl pointer-events-none select-none"
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
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Orbital ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/20 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 text-center space-y-4">
        <motion.div
          className="text-6xl mx-auto"
          animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          📖
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          AI Reading Companion
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          Your smart reading buddy! Paste any text and get instant explanations, 
          vocabulary builders, and fun quizzes to test your understanding.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {[
            { icon: "🧠", label: "AI Analysis" },
            { icon: "🃏", label: "Flashcards" },
            { icon: "🎯", label: "Quizzes" },
            { icon: "📊", label: "Progress" },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/20 text-xs font-medium"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
