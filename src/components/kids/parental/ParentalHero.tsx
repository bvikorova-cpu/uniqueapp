import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const floatingItems = [
  { emoji: "🛡️", left: "5%", top: "15%", delay: 0 },
  { emoji: "⭐", left: "90%", top: "10%", delay: 0.5 },
  { emoji: "📊", left: "8%", top: "75%", delay: 1 },
  { emoji: "🎯", left: "85%", top: "70%", delay: 1.5 },
  { emoji: "💡", left: "15%", top: "45%", delay: 2 },
  { emoji: "🏆", left: "92%", top: "40%", delay: 0.8 },
];

export const ParentalHero = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <>
      <FloatingHowItWorks title={"Parental Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Parental Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Parental Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 md:p-12 text-white">
      {floatingItems.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl md:text-3xl pointer-events-none select-none"
          style={{ left: item.left, top: item.top }}
          animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: item.delay }}
        >
          {item.emoji}
        </motion.span>
      ))}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl" />
      <motion.div className="relative z-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Parental Dashboard</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3">{greeting}, Parent! 👋</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">Track your child's progress, set limits, and maintain a safe digital environment</p>
        <motion.div className="flex flex-wrap justify-center gap-4 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {[{ label: "Secure", icon: "🔒" }, { label: "Monitored", icon: "👁️" }, { label: "Educational", icon: "📚" }].map((tag, i) => (
            <span key={i} className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm flex items-center gap-2">{tag.icon} {tag.label}</span>
          ))}
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};
