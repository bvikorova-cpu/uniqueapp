import { motion } from "framer-motion";
import { BookOpen, Brain, Star, Trophy, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface TopicProgress {
  topicId: string;
  topicTitle: string;
  topicEmoji: string;
  lessonsCompleted: number;
  totalLessons: number;
  quizScore: number;
  starsEarned: number;
  isCompleted: boolean;
}

interface ProgressDashboardProps {
  topicProgressList: TopicProgress[];
}

export const ProgressDashboard = ({ topicProgressList }: ProgressDashboardProps) => {
  const inProgress = topicProgressList.filter(t => t.lessonsCompleted > 0 && !t.isCompleted);
  const completed = topicProgressList.filter(t => t.isCompleted);

  if (inProgress.length === 0 && completed.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title="How Progress Dashboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-amber-200 p-6 mb-8"
    >
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        Learning Pipeline
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PipelineStage
          icon={<BookOpen className="w-5 h-5 text-blue-500" />}
          title="Lessons"
          count={inProgress.length}
          color="bg-blue-500"
          description="In progress"
        />
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>
        <PipelineStage
          icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
          title="Completed"
          count={completed.length}
          color="bg-amber-500"
          description="With stars"
        />
      </div>

      {inProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Continue Learning</h4>
          {inProgress.slice(0, 3).map((topic) => (
            <div key={topic.topicId} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border">
              <span className="text-2xl">{topic.topicEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{topic.topicTitle}</p>
                <Progress value={(topic.lessonsCompleted / topic.totalLessons) * 100} className="h-1.5 mt-1" />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {topic.lessonsCompleted}/{topic.totalLessons}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
    </>
    );
};

const PipelineStage = ({ icon, title, count, color, description }: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
  description: string;
}) => (
  <div className="bg-muted/50 rounded-xl p-4 text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      {icon}
      <span className="text-2xl font-black text-foreground">{count}</span>
    </div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);
