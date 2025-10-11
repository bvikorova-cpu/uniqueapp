import { useUserPoints } from "@/hooks/useGamification";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";

interface PointsDisplayProps {
  userId: string;
  compact?: boolean;
}

export default function PointsDisplay({ userId, compact = false }: PointsDisplayProps) {
  const { data: points } = useUserPoints(userId);

  if (!points) return null;

  const nextLevelPoints = (points.level * points.level) * 100;
  const progressPercent = (points.current_level_points / nextLevelPoints) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Trophy className="h-4 w-4 text-primary" />
        <span className="font-semibold">Level {points.level}</span>
        <span className="text-muted-foreground">|</span>
        <Star className="h-4 w-4 text-yellow-500" />
        <span>{points.total_points} bodov</span>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{points.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Celkové body</p>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-500" />
            <p className="text-2xl font-bold">{points.total_points}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progres na ďalší level</span>
          <span className="font-medium">{points.current_level_points} / {nextLevelPoints}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
    </Card>
  );
}
