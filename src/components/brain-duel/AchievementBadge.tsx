import { FRIEND_CHALLENGE_ACHIEVEMENTS, getRarityColor } from "@/types/brain-duel-achievements";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievementType: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function AchievementBadge({ 
  achievementType, 
  size = 'md',
  showLabel = false 
}: AchievementBadgeProps) {
  const achievement = FRIEND_CHALLENGE_ACHIEVEMENTS[achievementType];

  if (!achievement) return null;

  const Icon = achievement.icon;
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2">
            <div
              className={cn(
                'rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110',
                getRarityColor(achievement.rarity),
                sizeClasses[size]
              )}
            >
              <Icon className={cn(achievement.color, iconSizes[size])} />
            </div>
            {showLabel && (
              <span className="text-xs font-medium">{achievement.name}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            <p className="text-xs font-medium capitalize">
              {achievement.rarity} Achievement
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
