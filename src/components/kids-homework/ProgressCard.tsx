import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ProgressCardProps {
  points: {
    total_points: number;
    questions_answered: number;
    streak_days: number;
  } | null;
}

export const ProgressCard = ({ points }: ProgressCardProps) => {
  const nextMilestone = points ? Math.ceil((points.total_points + 1) / 100) * 100 : 100;
  const progressToNext = points ? ((points.total_points % 100) / 100) * 100 : 0;

  return (
    <>
      <FloatingHowItWorks title={"Progress Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Progress Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Progress Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Star className="w-5 h-5" />
              {points?.total_points || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-secondary">
              <Target className="w-5 h-5" />
              {points?.questions_answered || 0}
            </div>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-500">
              <Flame className="w-5 h-5" />
              {points?.streak_days || 0}
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Next Milestone</span>
            <span className="font-semibold">{nextMilestone} points</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>
      </CardContent>
    </Card>
    </>
  );
};
