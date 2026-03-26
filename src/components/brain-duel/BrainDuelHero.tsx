import { motion } from "framer-motion";
import { Brain, Zap, Flame, Trophy, Swords, Shield, Target, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrainDuelHeroProps {
  onlineCount: number;
  userId: string | null;
  totalMatches?: number;
}

const floatingIcons = [
  { icon: Brain, x: "8%", y: "18%", delay: 0, size: 30, color: "text-violet-500/20" },
  { icon: Zap, x: "88%", y: "12%", delay: 0.5, size: 26, color: "text-yellow-500/20" },
  { icon: Trophy, x: "12%", y: "72%", delay: 1, size: 24, color: "text-amber-500/20" },
  { icon: Swords, x: "85%", y: "68%", delay: 1.5, size: 28, color: "text-cyan-500/20" },
  { icon: Shield, x: "50%", y: "8%", delay: 0.3, size: 22, color: "text-primary/15" },
  { icon: Target, x: "75%", y: "78%", delay: 0.8, size: 20, color: "text-rose-500/20" },
  { icon: Star, x: "25%", y: "80%", delay: 1.2, size: 22, color: "text-emerald-500/20" },
  { icon: Flame, x: "65%", y: "15%", delay: 0.6, size: 24, color: "text-orange-500/20" },
];

export const BrainDuelHero = ({ onlineCount, userId, totalMatches = 0 }: BrainDuelHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-10">
      {/* Neon gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-primary/10 to-cyan-500/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Animated neon border glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{ boxShadow: "inset 0 0 60px hsl(var(--primary) / 0.1), 0 0 30px hsl(var(--primary) / 0.05)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className={`absolute pointer-events-none ${item.color}`}
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <Icon size={item.size} />
          </motion.div>
        );
      })}

      {/* Electric pulse rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/10"
            style={{ width: 200 + i * 100, height: 200 + i * 100, marginLeft: -(100 + i * 50), marginTop: -(100 + i * 50) }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8 md:p-12 text-center">
        {/* Status badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-green-500/15 text-green-500 border-green-500/30 animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block" />
            Live Now
          </Badge>
          <Badge variant="outline" className="backdrop-blur-sm border-primary/30">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            {onlineCount} {onlineCount === 1 ? 'player' : 'players'} online
          </Badge>
          {totalMatches > 0 && (
            <Badge variant="outline" className="backdrop-blur-sm border-primary/30">
              <Swords className="w-3 h-3 mr-1 text-primary" />
              {totalMatches.toLocaleString()} matches played
            </Badge>
          )}
        </motion.div>

        {/* Animated Brain icon */}
        <motion.div
          className="relative inline-block mb-4"
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 blur-xl bg-primary/20 rounded-full"
          />
          <Brain className="w-16 h-16 md:w-20 md:h-20 text-primary relative z-10" />
        </motion.div>

        {/* Title with neon glow */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="bg-gradient-to-r from-violet-400 via-primary to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            BrainDuel
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Knowledge Battle Arena • Test Your Brain Power
        </motion.p>

        {/* Quick stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-primary">10+</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-primary">4</div>
            <div className="text-xs text-muted-foreground">Leagues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-primary">∞</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
