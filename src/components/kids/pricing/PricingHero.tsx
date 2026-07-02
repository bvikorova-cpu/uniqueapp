import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const floatingEmojis = ["👑", "🎨", "📖", "🔬", "🎓", "🌙", "🏰", "⭐", "🎪", "📚"];

export function PricingHero() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return (
    <>
      <FloatingHowItWorks title={"Pricing Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Pricing Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pricing Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  return (
    <div className="relative text-center space-y-6 pt-20 pb-8 overflow-hidden">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl pointer-events-none select-none"
          style={{
            left: `${8 + (i * 9)}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3 + (i * 0.3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-amber-500" />
          <span className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Premium for Kids
          </span>
          <Sparkles className="h-6 w-6 text-amber-500" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Unlock the Magic
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            of Learning ✨
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
          One pass. All modules. Unlimited creativity, stories, homework help & more!
        </p>
      </motion.div>

      {/* Limited time countdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl px-6 py-3"
      >
        <span className="text-red-500 font-bold text-sm animate-pulse">🔥 LIMITED OFFER</span>
        <div className="flex gap-1">
          {[
            { val: timeLeft.hours, label: "h" },
            { val: timeLeft.minutes, label: "m" },
            { val: timeLeft.seconds, label: "s" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <span className="bg-red-500 text-white font-mono font-bold text-lg rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
                {String(t.val).padStart(2, "0")}
              </span>
              <span className="text-red-400 text-xs font-bold">{t.label}</span>
            </div>
          ))}
        </div>
        <span className="text-sm font-semibold text-foreground">Get 20% OFF!</span>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-8 pt-4"
      >
        {[
          { value: "50K+", label: "Happy Families" },
          { value: "4.9★", label: "Parent Rating" },
          { value: "10+", label: "Learning Modules" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-extrabold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
