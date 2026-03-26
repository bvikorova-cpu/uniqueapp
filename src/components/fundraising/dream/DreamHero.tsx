import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const floatingEmojis = [
  { emoji: "🚀", x: "10%", y: "20%", delay: 0, duration: 6 },
  { emoji: "🎨", x: "85%", y: "15%", delay: 1, duration: 7 },
  { emoji: "✈️", x: "75%", y: "70%", delay: 2, duration: 5 },
  { emoji: "🎓", x: "15%", y: "75%", delay: 0.5, duration: 8 },
  { emoji: "✨", x: "50%", y: "10%", delay: 1.5, duration: 6 },
  { emoji: "💡", x: "90%", y: "45%", delay: 3, duration: 7 },
  { emoji: "🌟", x: "5%", y: "50%", delay: 2.5, duration: 5 },
];

const stats = [
  { icon: Rocket, label: "Dreams Funded", value: "—" },
  { icon: TrendingUp, label: "Total Raised", value: "—" },
  { icon: Sparkles, label: "Success Rate", value: "—" },
];

export const DreamHero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden py-16 md:py-24">
      {/* Floating emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-4xl pointer-events-none select-none"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 10, -10, 5, 0],
            rotate: [0, 10, -10, 5, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Community-Powered Dreams</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight"
        >
          Dream Maker Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Share your dream and let the community help you make it happen. 
          From education to startups — every dream deserves a chance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            size="lg"
            onClick={() => navigate("/fundraising/dream/create")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-lg px-8"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Share Your Dream
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              document.getElementById("dream-campaigns")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Dreams
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="backdrop-blur-md bg-card/60 border border-border/50 rounded-2xl p-4 text-center"
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
