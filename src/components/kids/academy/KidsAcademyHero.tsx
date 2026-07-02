import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Star, Rocket, GraduationCap, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const floatingEmojis = ["🦄", "🌈", "⭐", "🧪", "🎨", "📖", "🚀", "🧙‍♂️", "🔬", "✏️"];

const mascotMessages = [
  { text: "Welcome to Kids Academy! Let's learn something amazing today! 🎓", mascot: "🦉" },
  { text: "Hey explorer! Ready for a new adventure? 🗺️", mascot: "🐉" },
  { text: "Great job coming back! Your streak is growing! 🔥", mascot: "🦊" },
  { text: "Did you know? Octopuses have 3 hearts! 🐙", mascot: "🧙‍♂️" },
  { text: "Try the Science Lab today — it's bubbling with fun! 🧪", mascot: "🤖" },
];

export const KidsAcademyHero = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % mascotMessages.length);
    }, 5000);
    return (
    <>
      <FloatingHowItWorks title={"Kids Academy Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Kids Academy Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Kids Academy Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  const current = mascotMessages[msgIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-pink-500/15 to-amber-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

      {/* Animated glow border */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{ boxShadow: "inset 0 0 40px hsl(var(--primary) / 0.1)" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl pointer-events-none select-none"
          style={{
            left: `${5 + (i * 10) % 90}%`,
            top: `${8 + (i * 13) % 70}%`,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.25,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Sparkle particles */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-2 h-2 rounded-full bg-primary/30"
          style={{ left: `${20 + i * 30}%`, top: `${30 + i * 15}%` }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}

      <div className="relative z-10 p-6 sm:p-10 md:p-12">
        {/* Top badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-green-500/15 text-green-600 border-green-500/30">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block animate-pulse" />
            Safe for Kids
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            <GraduationCap className="w-3 h-3 mr-1" />
            Ages 6-12
          </Badge>
          <Badge variant="outline" className="border-amber-500/30 text-amber-600">
            <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
            AI-Powered
          </Badge>
        </motion.div>

        {/* Mascot + title area */}
        <div className="text-center">
          {/* Animated mascot */}
          <motion.div
            className="relative inline-block mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-xl bg-primary/20 rounded-full"
            />
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={msgIndex}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 20 }}
                  className="text-4xl sm:text-5xl"
                >
                  {current.mascot}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Kids Academy
            </span>
            <span className="ml-2">🎓</span>
          </motion.h1>

          {/* Mascot speech bubble */}
          <motion.div
            className="max-w-md mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-card/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-border/50 shadow-sm"
              >
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  {current.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 sm:gap-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { icon: Rocket, value: "6+", label: "Modules" },
              { icon: Wand2, value: "AI", label: "Powered" },
              { icon: Sparkles, value: "∞", label: "Adventures" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
