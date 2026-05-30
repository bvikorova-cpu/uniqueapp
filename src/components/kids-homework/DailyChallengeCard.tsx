import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Target } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

interface Challenge {
  id: string;
  challenge_title: string;
  challenge_description: string;
  icon: string;
  bonus_points: number;
  requirement_value: number;
  challenge_type: string;
}

interface DailyProgress {
  questions_today: number;
  subjects_today: string[];
}

interface DailyChallengeCardProps {
  challenge: Challenge | null;
  progress: DailyProgress | null;
  isCompleted: boolean;
}

export const DailyChallengeCard = ({ challenge, progress, isCompleted }: DailyChallengeCardProps) => {
  const prevIsCompleted = useRef(isCompleted);

  // Trigger confetti when challenge is completed
  useEffect(() => {
    if (isCompleted && !prevIsCompleted.current) {
      // Trigger multiple confetti bursts for celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Also trigger a bigger burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    }
    prevIsCompleted.current = isCompleted;
  }, [isCompleted]);

  if (!challenge) {
    return (
      <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-300/50">
        <CardContent className="py-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <p className="text-muted-foreground">No challenge available today. Check back tomorrow!</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage
  let currentProgress = 0;
  let progressPercentage = 0;

  if (progress && !isCompleted) {
    switch (challenge.challenge_type) {
      case 'questions_count':
        currentProgress = progress.questions_today;
        break;
      case 'diverse_subjects':
        currentProgress = progress.subjects_today.length;
        break;
      case 'subject_focus': {
        const subjectCounts: { [key: string]: number } = {};
        for (const subject of progress.subjects_today) {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        }
        currentProgress = Math.max(...Object.values(subjectCounts), 0);
        break;
      }
    }
    progressPercentage = Math.min((currentProgress / challenge.requirement_value) * 100, 100);
  } else if (isCompleted) {
    currentProgress = challenge.requirement_value;
    progressPercentage = 100;
  }

  return (
    <Card className={`relative overflow-hidden ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
        : 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-300/50'
    }`}>
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{challenge.icon}</div>
            <div>
              <CardTitle className="text-lg mb-1">{challenge.challenge_title}</CardTitle>
              <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                {isCompleted ? 'Completed!' : `+${challenge.bonus_points} Bonus Points`}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.challenge_description}</p>
        
        {!isCompleted && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">
                {currentProgress} / {challenge.requirement_value}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              🎉 You earned {challenge.bonus_points} bonus points!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
