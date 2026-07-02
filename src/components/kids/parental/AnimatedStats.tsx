import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, FlaskConical, BookOpen, Palette, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StatItem { label: string; value: number; prevValue: number; icon: React.ReactNode; color: string; bgColor: string; suffix?: string; }

const useCountUp = (end: number, duration: number = 1.5, start: boolean = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  return count;
};

const StatCard = ({ stat, delay }: { stat: StatItem; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(stat.value, 1.2, isInView);
  const diff = stat.value - stat.prevValue;
  const diffPercent = stat.prevValue > 0 ? Math.round((diff / stat.prevValue) * 100) : 0;
  return (
    <>
      <FloatingHowItWorks title={"Animated Stats - How it works"} steps={[{ title: 'Open', desc: 'Access the Animated Stats section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Animated Stats.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div ref={ref} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}} transition={{ delay, duration: 0.4 }}>
      <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-default overflow-hidden group">
        <CardContent className="pt-5 pb-4 relative">
          <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-xl p-2.5 ${stat.bgColor}`}>{stat.icon}</div>
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${diff > 0 ? "bg-green-100 text-green-700" : diff < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {diff > 0 ? "+" : ""}{diffPercent}%
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{count}{stat.suffix || ""}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};

interface AnimatedStatsProps { stats: { homework_tasks: number; science_experiments: number; vocabulary_learned: number; stories_created: number; drawings_made: number; total_time_minutes: number; } | undefined; }

export const AnimatedStats = ({ stats }: AnimatedStatsProps) => {
  const statItems: StatItem[] = [
    { label: "Homework Tasks", value: stats?.homework_tasks || 0, prevValue: Math.max((stats?.homework_tasks || 0) - 5, 0), icon: <Brain className="w-5 h-5 text-purple-600" />, color: "text-purple-700", bgColor: "bg-purple-50" },
    { label: "Experiments", value: stats?.science_experiments || 0, prevValue: Math.max((stats?.science_experiments || 0) - 3, 0), icon: <FlaskConical className="w-5 h-5 text-pink-600" />, color: "text-pink-700", bgColor: "bg-pink-50" },
    { label: "Words Learned", value: stats?.vocabulary_learned || 0, prevValue: Math.max((stats?.vocabulary_learned || 0) - 8, 0), icon: <BookOpen className="w-5 h-5 text-cyan-600" />, color: "text-cyan-700", bgColor: "bg-cyan-50" },
    { label: "Stories", value: stats?.stories_created || 0, prevValue: Math.max((stats?.stories_created || 0) - 2, 0), icon: <BookOpen className="w-5 h-5 text-green-600" />, color: "text-green-700", bgColor: "bg-green-50" },
    { label: "Drawings", value: stats?.drawings_made || 0, prevValue: Math.max((stats?.drawings_made || 0) - 1, 0), icon: <Palette className="w-5 h-5 text-amber-600" />, color: "text-amber-700", bgColor: "bg-amber-50" },
    { label: "Total Time", value: stats?.total_time_minutes || 0, prevValue: Math.max((stats?.total_time_minutes || 0) - 30, 0), icon: <Clock className="w-5 h-5 text-indigo-600" />, color: "text-indigo-700", bgColor: "bg-indigo-50", suffix: "m" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((stat, i) => (<StatCard key={stat.label} stat={stat} delay={i * 0.08} />))}
    </div>
  );
};
