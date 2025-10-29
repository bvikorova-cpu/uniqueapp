import { useUserBadges, useAllBadges } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgesDisplayProps {
  userId: string;
}

export default function BadgesDisplay({ userId }: BadgesDisplayProps) {
  const { data: userBadges = [] } = useUserBadges(userId);
  const { data: allBadges = [] } = useAllBadges();

  const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badge_id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏅 Badges
          <Badge variant="secondary">{userBadges.length}/{allBadges.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {allBadges.map((badge: any) => {
            const earned = earnedBadgeIds.has(badge.id);
            const userBadge = userBadges.find((ub: any) => ub.badge_id === badge.id);

            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${earned 
                        ? "border-primary bg-primary/5 hover:bg-primary/10" 
                        : "border-muted bg-muted/50 opacity-50"
                      }
                    `}
                  >
                    <div className="text-4xl relative">
                      {badge.icon}
                      {!earned && (
                        <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-1">
                      {badge.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{badge.icon} {badge.name}</p>
                    <p className="text-sm">{badge.description}</p>
                    <p className="text-xs text-muted-foreground">
                      +{badge.points_reward} points
                    </p>
                    {earned && userBadge && (
                      <p className="text-xs text-green-500">
                        ✓ Earned: {new Date(userBadge.earned_at).toLocaleDateString("en-US")}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
