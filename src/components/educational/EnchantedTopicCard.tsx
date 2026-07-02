import { motion } from "framer-motion";
import { BookOpen, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface EnchantedTopicCardProps {
  topic: {
    id: string;
    title: string;
    emoji: string;
    category: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
  };
  index: number;
  progress?: {
    lessonsCompleted: number;
    totalLessons: number;
    starsEarned: number;
    isCompleted: boolean;
  };
  onStart: () => void;
}

const categoryColors: Record<string, { bg: string; border: string; badge: string }> = {
  Language: { bg: "from-blue-50 to-indigo-50", border: "border-blue-200 hover:border-blue-400", badge: "bg-blue-100 text-blue-700" },
  Math: { bg: "from-emerald-50 to-teal-50", border: "border-emerald-200 hover:border-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  Art: { bg: "from-pink-50 to-rose-50", border: "border-pink-200 hover:border-pink-400", badge: "bg-pink-100 text-pink-700" },
  Arts: { bg: "from-pink-50 to-rose-50", border: "border-pink-200 hover:border-pink-400", badge: "bg-pink-100 text-pink-700" },
  Science: { bg: "from-purple-50 to-violet-50", border: "border-purple-200 hover:border-purple-400", badge: "bg-purple-100 text-purple-700" },
  Health: { bg: "from-red-50 to-orange-50", border: "border-red-200 hover:border-red-400", badge: "bg-red-100 text-red-700" },
  Social: { bg: "from-amber-50 to-yellow-50", border: "border-amber-200 hover:border-amber-400", badge: "bg-amber-100 text-amber-700" },
  "Life Skills": { bg: "from-cyan-50 to-sky-50", border: "border-cyan-200 hover:border-cyan-400", badge: "bg-cyan-100 text-cyan-700" },
  Culture: { bg: "from-orange-50 to-amber-50", border: "border-orange-200 hover:border-orange-400", badge: "bg-orange-100 text-orange-700" },
};

const difficultyConfig = {
  easy: { label: "Easy", color: "bg-green-400" },
  medium: { label: "Medium", color: "bg-amber-400" },
  hard: { label: "Hard", color: "bg-red-400" },
};

export const EnchantedTopicCard = ({ topic, index, progress, onStart }: EnchantedTopicCardProps) => {
  const colors = categoryColors[topic.category] || categoryColors.Science;
  const diff = difficultyConfig[topic.difficulty];
  const hasProgress = progress && progress.lessonsCompleted > 0;
  const isCompleted = progress?.isCompleted;

  return (
    <>
      <FloatingHowItWorks title="How Enchanted Topic Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group"
    >
      <div className={`
        relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} 
        border-2 ${colors.border} transition-all duration-300 
        shadow-lg hover:shadow-2xl cursor-pointer backdrop-blur-sm
      `}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              ✓ Done
            </div>
          </div>
        )}

        <div className="relative p-5">
          {/* Emoji with animated bounce */}
          <motion.div 
            className="text-5xl md:text-6xl mb-3 text-center"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
          >
            {topic.emoji}
          </motion.div>

          <h3 className="text-lg font-bold text-foreground mb-1 text-center leading-tight">
            {topic.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-3 text-center line-clamp-2">
            {topic.description}
          </p>

          {/* Category & difficulty */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${colors.badge}`}>
              {topic.category}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${diff.color}`} />
              <span className="text-xs text-muted-foreground font-medium">{diff.label}</span>
            </div>
          </div>

          {/* Progress bar */}
          {hasProgress && !isCompleted && (
            <div className="mb-3">
              <Progress value={(progress.lessonsCompleted / progress.totalLessons) * 100} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.lessonsCompleted}/{progress.totalLessons} lessons
              </p>
            </div>
          )}

          {/* Stars */}
          {isCompleted && progress && (
            <div className="flex justify-center gap-1 mb-3">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < progress.starsEarned ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
            size="sm"
            onClick={onStart}
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            {isCompleted ? "Review" : hasProgress ? "Continue" : "Start"}
          </Button>
        </div>
      </div>
    </motion.div>
    </>
    );
};
