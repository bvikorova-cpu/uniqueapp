import { FRIEND_CHALLENGE_ACHIEVEMENTS, getRarityColor } from "@/types/brain-duel-achievements";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AchievementBadgeProps {
  achievementType: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function AchievementBadge({ 
  achievementType, 
  size = 'md',
  showLabel = false 
}: AchievementBadgeProps) { const achievement = FRIEND_CHALLENGE_ACHIEVEMENTS[achievementType];

  if (!achievement) return null;

  const Icon = achievement.icon;
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-14 w-14' };
  
  const iconSizes = { sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-7 w-7' };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className="inline-flex items-center gap-2"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={cn(
                'rounded-full border-2 flex items-center justify-center transition-all shadow-md backdrop-blur-sm',
                getRarityColor(achievement.rarity),
                sizeClasses[size]
              )}
            >
              <Icon className={cn(achievement.color, iconSizes[size])} />
            </div>
            {showLabel && (
              <span className="text-xs font-semibold">{achievement.name}</span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="backdrop-blur-xl bg-card/90 border-primary/20">
          <div className="space-y-1">
            <p className="font-bold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            <p className="text-xs font-semibold capitalize text-primary">
              {achievement.rarity} Achievement
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}