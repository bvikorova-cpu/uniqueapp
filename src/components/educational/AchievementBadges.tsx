import { motion } from "framer-motion";
import { Award, Star, BookOpen, Brain, Flame, Trophy } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  completedTopics: number;
  totalStars: number;
  streak: number;
  quizzesPassed: number;
}

export const AchievementBadges = ({ completedTopics, totalStars, streak, quizzesPassed }: AchievementBadgesProps) => {
  const achievements: Achievement[] = [
    {
      id: "first-star",
      icon: <Star className="w-6 h-6" />,
      title: "First Star",
      description: "Earn your first star",
      unlocked: totalStars >= 1,
      progress: Math.min(totalStars, 1),
      maxProgress: 1,
    },
    {
      id: "topic-master",
      icon: <BookOpen className="w-6 h-6" />,
      title: "Topic Explorer",
      description: "Complete 5 topics",
      unlocked: completedTopics >= 5,
      progress: Math.min(completedTopics, 5),
      maxProgress: 5,
    },
    {
      id: "quiz-genius",
      icon: <Brain className="w-6 h-6" />,
      title: "Quiz Genius",
      description: "Pass 10 quizzes",
      unlocked: quizzesPassed >= 10,
      progress: Math.min(quizzesPassed, 10),
      maxProgress: 10,
    },
    {
      id: "streak-fire",
      icon: <Flame className="w-6 h-6" />,
      title: "On Fire",
      description: "7-day learning streak",
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      maxProgress: 7,
    },
    {
      id: "star-collector",
      icon: <Trophy className="w-6 h-6" />,
      title: "Star Collector",
      description: "Earn 30 stars",
      unlocked: totalStars >= 30,
      progress: Math.min(totalStars, 30),
      maxProgress: 30,
    },
    {
      id: "completionist",
      icon: <Award className="w-6 h-6" />,
      title: "Completionist",
      description: "Complete all 19 topics",
      unlocked: completedTopics >= 19,
      progress: Math.min(completedTopics, 19),
      maxProgress: 19,
    },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Achievement Badges works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 p-6 mb-8"
    >
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-500" />
        Achievements
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {achievements.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`
              relative flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all
              ${achievement.unlocked
                ? 'bg-gradient-to-b from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-md'
                : 'bg-muted/50 border-2 border-transparent opacity-60'
              }
            `}
          >
            {achievement.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                ✓
              </motion.div>
            )}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${achievement.unlocked
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {achievement.icon}
            </div>
            <p className="text-xs font-bold text-foreground leading-tight">{achievement.title}</p>
            <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className="bg-amber-400 h-1 rounded-full transition-all"
                  style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
    );
};
