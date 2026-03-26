import { motion } from "framer-motion";
import { Sparkles, Palette, Brush, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const floatingItems = [
  { emoji: "🎨", left: "5%", top: "15%", delay: 0 },
  { emoji: "✏️", left: "92%", top: "10%", delay: 0.5 },
  { emoji: "🖌️", left: "8%", top: "75%", delay: 1 },
  { emoji: "🌈", left: "88%", top: "70%", delay: 1.5 },
  { emoji: "⭐", left: "15%", top: "45%", delay: 2 },
  { emoji: "🦋", left: "90%", top: "40%", delay: 0.8 },
  { emoji: "🎭", left: "50%", top: "8%", delay: 1.2 },
  { emoji: "🖍️", left: "75%", top: "80%", delay: 0.3 },
];

interface ColoringHeroProps {
  totalPages: number;
  credits: number | string;
}

export function ColoringHero({ totalPages, credits }: ColoringHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-8 md:p-12 text-white mb-8">
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

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Creativity</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-black mb-3">
          AI Coloring Page <span className="text-yellow-300">Studio</span>
        </h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-6">
          Transform any image or idea into beautiful coloring pages. Paint online, collect favorites, and earn creative badges!
        </p>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: `${totalPages} Pages Created`, icon: "🖼️" },
            { label: typeof credits === "string" ? credits : `${credits} Credits`, icon: "✨" },
            { label: "HD & Ultra HD", icon: "🎯" },
          ].map((tag, i) => (
            <span
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm flex items-center gap-2"
            >
              {tag.icon} {tag.label}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
