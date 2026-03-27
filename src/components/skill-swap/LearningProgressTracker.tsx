import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Target, TrendingUp, Clock, CheckCircle, Plus } from "lucide-react";

interface LearningGoal {
  id: string;
  skill: string;
  emoji: string;
  progress: number;
  totalHours: number;
  completedHours: number;
  level: string;
  milestones: { label: string; completed: boolean }[];
  lastSession: string;
}

const MOCK_GOALS: LearningGoal[] = [
  {
    id: "1", skill: "Guitar", emoji: "🎸", progress: 65, totalHours: 50, completedHours: 32,
    level: "Intermediate",
    milestones: [
      { label: "Basic chords", completed: true },
      { label: "Strumming patterns", completed: true },
      { label: "First song", completed: true },
      { label: "Barre chords", completed: false },
      { label: "Fingerpicking", completed: false },
    ],
    lastSession: "2 days ago",
  },
  {
    id: "2", skill: "Spanish", emoji: "🇪🇸", progress: 40, totalHours: 100, completedHours: 40,
    level: "Pre-Intermediate",
    milestones: [
      { label: "Greetings & basics", completed: true },
      { label: "Present tense", completed: true },
      { label: "Past tense", completed: false },
      { label: "Conversational", completed: false },
      { label: "Fluent", completed: false },
    ],
    lastSession: "Yesterday",
  },
  {
    id: "3", skill: "Photography", emoji: "📸", progress: 85, totalHours: 30, completedHours: 25,
    level: "Advanced",
    milestones: [
      { label: "Camera basics", completed: true },
      { label: "Composition", completed: true },
      { label: "Lighting", completed: true },
      { label: "Post-processing", completed: true },
      { label: "Portfolio ready", completed: false },
    ],
    lastSession: "Today",
  },
  {
    id: "4", skill: "Cooking", emoji: "👨‍🍳", progress: 20, totalHours: 40, completedHours: 8,
    level: "Beginner",
    milestones: [
      { label: "Kitchen safety", completed: true },
      { label: "Basic techniques", completed: false },
      { label: "5 recipes", completed: false },
      { label: "Meal planning", completed: false },
      { label: "Dinner party", completed: false },
    ],
    lastSession: "5 days ago",
  },
];

interface LearningProgressTrackerProps {
  onBack: () => void;
}

export const LearningProgressTracker = ({ onBack }: LearningProgressTrackerProps) => {
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);

  const totalHoursLearned = MOCK_GOALS.reduce((sum, g) => sum + g.completedHours, 0);
  const avgProgress = Math.round(MOCK_GOALS.reduce((sum, g) => sum + g.progress, 0) / MOCK_GOALS.length);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Learning Progress
        </h2>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Goal
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Skills Learning", value: MOCK_GOALS.length.toString(), emoji: "📚", color: "from-primary to-accent" },
          { label: "Hours Learned", value: totalHoursLearned.toString(), emoji: "⏱️", color: "from-amber-500 to-orange-500" },
          { label: "Avg. Progress", value: `${avgProgress}%`, emoji: "📈", color: "from-emerald-500 to-teal-500" },
          { label: "Milestones Hit", value: MOCK_GOALS.reduce((sum, g) => sum + g.milestones.filter(m => m.completed).length, 0).toString(), emoji: "🏆", color: "from-purple-500 to-pink-500" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border/50">
              <span className="text-2xl block mb-1">{stat.emoji}</span>
              <div className="text-xl font-black">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Learning Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_GOALS.map((goal, i) => (
          <motion.div key={goal.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card
              className={`p-5 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all cursor-pointer ${
                selectedGoal?.id === goal.id ? "ring-2 ring-primary/30 border-primary/30" : ""
              }`}
              onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl">
                    {goal.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{goal.skill}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{goal.level}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {goal.lastSession}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-black text-primary">{goal.progress}%</span>
              </div>

              <div className="space-y-2">
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{goal.completedHours}h completed</span>
                  <span>{goal.totalHours}h total</span>
                </div>
              </div>

              {/* Milestones (expanded) */}
              {selectedGoal?.id === goal.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border/30">
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" /> Milestones
                  </h4>
                  <div className="space-y-1.5">
                    {goal.milestones.map((m, j) => (
                      <div key={j} className={`flex items-center gap-2 text-xs p-1.5 rounded-lg ${m.completed ? "text-emerald-600" : "text-muted-foreground"}`}>
                        <CheckCircle className={`w-3.5 h-3.5 ${m.completed ? "text-emerald-500" : "text-border"}`} />
                        <span className={m.completed ? "line-through opacity-70" : ""}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
