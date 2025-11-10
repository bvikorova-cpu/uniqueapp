import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  showProgress?: boolean;
}

export const LevelBadge = ({ 
  level, 
  experience, 
  experienceToNextLevel,
  showProgress = true 
}: LevelBadgeProps) => {
  const progressPercent = (experience / experienceToNextLevel) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-3 py-1">
          <Star className="h-3 w-3 mr-1" />
          Level {level}
        </Badge>
      </div>
      
      {showProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>XP: {experience}</span>
            <span>{experienceToNextLevel}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}
    </div>
  );
};
