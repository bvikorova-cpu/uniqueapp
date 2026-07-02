import { motion } from "framer-motion";
import { BookOpen, Star, Trophy, Flame, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EducationalHeroProps {
  totalStars: number;
  completedTopics: number;
  totalTopics: number;
  streak: number;
}

const floatingEmojis = ["📚", "🔬", "🌍", "🎨", "🧮", "🪐", "🦕", "🎵", "⚽", "🧪"];

export const EducationalHero = ({ totalStars, completedTopics, totalTopics, streak }: EducationalHeroProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Educational Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Educational Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Educational Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 md:p-12 mb-8">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-4xl opacity-20 select-none pointer-events-none"
          style={{
            left: `${(i * 10) + 5}%`,
            top: `${(i % 3) * 30 + 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 + (i * 0.4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Glowing orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-300/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
            <Sparkles className="w-4 h-4" />
            Learning Adventure
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-center text-white mb-3"
        >
          Learn & Play! 🎓
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 text-center mb-8 max-w-2xl mx-auto"
        >
          Fun interactive stories that teach you amazing things about the world!
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          <StatCard icon={<BookOpen className="w-5 h-5" />} value={`${completedTopics}/${totalTopics}`} label="Topics" />
          <StatCard icon={<Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />} value={totalStars.toString()} label="Stars" />
          <StatCard icon={<Trophy className="w-5 h-5 text-amber-300" />} value={`${Math.round((completedTopics / totalTopics) * 100)}%`} label="Progress" />
          <StatCard icon={<Flame className="w-5 h-5 text-red-300" />} value={`${streak}d`} label="Streak" />
        </motion.div>
      </div>
    </div>
    </>
  );
};

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
    <div className="flex items-center justify-center gap-1.5 mb-1">
      {icon}
      <span className="text-xl font-black text-white">{value}</span>
    </div>
    <span className="text-xs text-white/70 font-medium">{label}</span>
  </div>
);
