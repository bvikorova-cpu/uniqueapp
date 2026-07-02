import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Flame, CheckCircle2, Clock, Sparkles, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "breathing" | "mindfulness" | "gratitude" | "movement";
  duration: string;
  xp: number;
  completed: boolean;
}

const DAILY_CHALLENGES: Challenge[] = [
  { id: "1", title: "Morning Breath Work", description: "Complete a 5-minute breathing exercise to start your day", category: "breathing", duration: "5 min", xp: 25, completed: false },
  { id: "2", title: "Gratitude Check-In", description: "Write 3 things you are grateful for today", category: "gratitude", duration: "3 min", xp: 20, completed: false },
  { id: "3", title: "Mindful Walk", description: "Take a 10-minute walk while observing your senses", category: "movement", duration: "10 min", xp: 35, completed: false },
  { id: "4", title: "Body Scan", description: "Perform a full body scan meditation before sleep", category: "mindfulness", duration: "8 min", xp: 30, completed: false },
  { id: "5", title: "Digital Detox Hour", description: "Spend 1 hour away from screens and devices", category: "mindfulness", duration: "60 min", xp: 50, completed: false },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  breathing: { bg: "bg-sky-500/15 border-sky-500/30", text: "text-sky-400" },
  mindfulness: { bg: "bg-violet-500/15 border-violet-500/30", text: "text-violet-400" },
  gratitude: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400" },
  movement: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
};

export function DailyWellnessChallenges() {
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES);
  const [streak] = useState(3);
  const { toast } = useToast();

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalXP = challenges.filter((c) => c.completed).reduce((sum, c) => sum + c.xp, 0);
  const progress = (completedCount / challenges.length) * 100;

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.completed) {
          toast({
            title: "Challenge Completed! 🎉",
            description: `+${c.xp} XP earned for "${c.title}"`,
          });
          return { ...c, completed: true };
        }
        return c;
      })
    );
  };

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="DailyWellnessChallenges — How it works" steps={[{title:"Open this tool",desc:"Access DailyWellnessChallenges within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-primary/5 to-emerald-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              Daily Wellness Challenges
            </CardTitle>
            <CardDescription>Complete daily tasks to build your wellness streak</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{completedCount}/{challenges.length} completed</span>
            <span className="text-primary font-semibold">{totalXP} XP earned</span>
          </div>
          <Progress value={progress} className="h-2" />
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">All challenges completed! Great work!</span>
            </motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        <AnimatePresence>
          {challenges.map((challenge, index) => {
            const colors = CATEGORY_COLORS[challenge.category];
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  challenge.completed
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                    : "bg-card/40 border-border/30 hover:border-primary/20"
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full flex-shrink-0 w-10 h-10 ${
                    challenge.completed
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-card/60 text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => toggleChallenge(challenge.id)}
                  disabled={challenge.completed}
                >
                  {challenge.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-current" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-sm font-semibold ${challenge.completed ? "line-through text-muted-foreground" : ""}`}>
                      {challenge.title}
                    </h4>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${colors.bg} ${colors.text} border`}>
                      {challenge.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {challenge.duration}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Star className="w-3 h-3" />
                    {challenge.xp} XP
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
