import { motion } from "framer-motion";
import { BookOpen, Palette, Sparkles, PaintBucket, TrendingUp, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GalleryStatsProps {
  stories: number;
  drawings: number;
  characters: number;
  coloringPages: number;
  streak: number;
}

function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{count}</>;
}

const stats = [
  { key: "stories", icon: BookOpen, label: "Stories", gradient: "from-purple-500 to-violet-600", bg: "bg-purple-500/10" },
  { key: "drawings", icon: Palette, label: "Drawings", gradient: "from-pink-500 to-rose-600", bg: "bg-pink-500/10" },
  { key: "characters", icon: Sparkles, label: "Characters", gradient: "from-blue-500 to-cyan-600", bg: "bg-blue-500/10" },
  { key: "coloringPages", icon: PaintBucket, label: "Coloring", gradient: "from-orange-500 to-amber-600", bg: "bg-orange-500/10" },
];

export function GalleryStats({ stories, drawings, characters, coloringPages, streak }: GalleryStatsProps) {
  const values: Record<string, number> = { stories, drawings, characters, coloringPages };
  const total = stories + drawings + characters + coloringPages;

  return (
    <>
      <FloatingHowItWorks title={"Gallery Stats - How it works"} steps={[{ title: 'Open', desc: 'Access the Gallery Stats section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gallery Stats.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto mb-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`${s.bg} backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center`}
          >
            <s.icon className={`w-6 h-6 mx-auto mb-2 bg-gradient-to-r ${s.gradient} bg-clip-text`} style={{ color: 'transparent', WebkitBackgroundClip: 'text' }} />
            <div className="text-2xl font-black">
              <AnimatedCounter target={values[s.key]} />
            </div>
            <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500/10 to-red-500/10 backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center"
        >
          <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-black text-orange-600">{streak}</div>
          <div className="text-xs text-muted-foreground font-medium">Day Streak</div>
        </motion.div>
      </div>

      {/* Progress ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-3 mt-4"
      >
        <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-full px-5 py-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{total} total creations</span>
        </div>
      </motion.div>
    </div>
    </>
  );
}
