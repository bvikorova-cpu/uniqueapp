import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Brain, Rocket, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const mascotMessages = [
  { text: "Hey there, little genius! What are we learning today? 🎓", mascot: "🤖" },
  { text: "I love math! Want me to help with some equations? ➕", mascot: "🧮" },
  { text: "Did you know? Honey never spoils! 🍯", mascot: "🦉" },
  { text: "Let's make homework fun together! 🚀", mascot: "🧙‍♂️" },
  { text: "You're getting smarter every day! Keep going! 💪", mascot: "🐉" },
];

const floatingEmojis = ["📐", "🔬", "📖", "🌍", "✏️", "🧪", "📚", "🎯", "💡", "🧠"];

export const HomeworkHero = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % mascotMessages.length);
    }, 5000);
    return (
    <>
      <FloatingHowItWorks title={"Homework Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Homework Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Homework Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  const current = mascotMessages[msgIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-primary/10 to-emerald-500/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{ boxShadow: "inset 0 0 50px hsl(var(--primary) / 0.1)" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-xl sm:text-2xl pointer-events-none select-none"
          style={{ left: `${5 + (i * 10) % 90}%`, top: `${8 + (i * 13) % 75}%` }}
          animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 6 : -6, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="relative z-10 p-6 sm:p-10">
        {/* Top badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-green-500/15 text-green-600 border-green-500/30">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block animate-pulse" />
            Safe for Kids
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            <Brain className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="border-amber-500/30 text-amber-600">
            <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
            Grades 1-6
          </Badge>
        </motion.div>

        <div className="text-center">
          {/* Mascot */}
          <motion.div
            className="relative inline-block mb-4"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-xl bg-primary/20 rounded-full"
            />
            <div className="relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={msgIndex}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 15 }}
                  className="text-4xl sm:text-5xl"
                >
                  {current.mascot}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              AI Homework Helper
            </span>
            <span className="ml-2">📚</span>
          </motion.h1>

          {/* Speech bubble */}
          <motion.div
            className="max-w-md mx-auto mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-card/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-border/50 shadow-sm"
              >
                <p className="text-sm sm:text-base text-muted-foreground font-medium">{current.text}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { icon: BookOpen, value: "5", label: "Subjects" },
              { icon: Rocket, value: "AI", label: "Tutor" },
              { icon: Sparkles, value: "∞", label: "Questions" },
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
