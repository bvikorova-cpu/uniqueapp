import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBadges } from "@/hooks/useBadges";
import { Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from "@/components/ui/tooltip";

interface BadgesDisplayProps {
  userId: string;
}

export const BadgesDisplay = ({ userId }: BadgesDisplayProps) => {
  const { badges, isLoading } = useBadges(userId);

  if (isLoading || badges.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Badges</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {badges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                  🏆
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">Badge #{badge.badge_id}</p>
                  <p className="text-xs text-muted-foreground">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </Card>
  );
};
