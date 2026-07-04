import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Camera, Music, Bot, Trophy, Heart, Globe2, Palette } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const PERKS = [
  { icon: Bot, title: "Unlimited AI Chat", desc: "Talk to any AI character without limits", color: "from-blue-500 to-cyan-500" },
  { icon: Camera, title: "AI Photo Studio", desc: "Pro-grade transformations & restoration", color: "from-purple-500 to-pink-500" },
  { icon: Music, title: "AI Music Generation", desc: "Create songs in any genre, any voice", color: "from-amber-500 to-rose-500" },
  { icon: Trophy, title: "0% Bazaar Commission", desc: "Keep every euro of your sales", color: "from-emerald-500 to-teal-500" },
  { icon: Sparkles, title: "Featured Listings", desc: "Top of every search result", color: "from-yellow-500 to-orange-500" },
  { icon: Zap, title: "Priority Speed", desc: "Faster AI responses, no queues", color: "from-violet-500 to-fuchsia-500" },
  { icon: Heart, title: "Anonymous Dating Pro", desc: "Unlimited matches & reveals", color: "from-rose-500 to-red-500" },
  { icon: Globe2, title: "All Hubs Unlocked", desc: "GP Racing, KitchenStars, Kids, Time Capsule…", color: "from-sky-500 to-indigo-500" },
  { icon: Palette, title: "Custom Branding", desc: "Make Unique truly yours", color: "from-pink-500 to-purple-500" },
];

/** Auto-rotating spotlight of all premium perks. */
export const PerksCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PERKS.length), 3500);
    return () => clearInterval(id);
  }, []);

  const perk = PERKS[index];
  const Icon = perk.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 max-w-5xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">Everything you unlock</h2>
        <p className="text-muted-foreground">9 game-changing perks. One subscription.</p>
      </div>

      <div className="relative h-[260px] rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-br ${perk.color} opacity-40`}
          />
        </AnimatePresence>

        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className={`p-5 rounded-3xl bg-gradient-to-br ${perk.color} shadow-2xl mb-4 ring-2 ring-white/20`}>
                <Icon className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-black mb-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {perk.title}
              </h3>
              <p className="text-base sm:text-lg text-white/95 max-w-md font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                {perk.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {PERKS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Show perk ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
