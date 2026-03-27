import { motion } from "framer-motion";
import { PenTool, Users, Star, Zap, FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const stats = [
  { icon: Users, label: "Active Writers", value: 920, suffix: "+" },
  { icon: FileText, label: "Content Created", value: 4500, suffix: "+" },
  { icon: Star, label: "Satisfaction", value: 96, suffix: "%" },
  { icon: Zap, label: "Avg. Generation", value: 8, suffix: "s" },
];

interface ForgeHeroProps {
  credits: number;
  creditsLoading: boolean;
}

export function ForgeHero({ credits, creditsLoading }: ForgeHeroProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4"
      >
        <PenTool className="w-4 h-4" />
        <span className="font-medium">AI-Powered Creative Writing</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
      >
        CreativeForge
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto mb-4"
      >
        Professional AI writing studio — from lyrics to screenplays, poetry to ad copy
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-center gap-3 mb-8"
      >
        <Badge variant="outline" className="text-sm px-4 py-2 backdrop-blur-sm bg-card/60 border-border/50">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          {creditsLoading ? "..." : credits} Credits Available
        </Badge>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            className="relative group p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all"
          >
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
