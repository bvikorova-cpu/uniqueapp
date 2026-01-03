import { useUserBadges, useAllBadges } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Trophy } from "lucide-react";
import { useEffect, useRef, useMemo } from "react";
import { triggerBadgeConfetti } from "@/utils/confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface BadgesDisplayProps {
  userId: string;
}

export default function BadgesDisplay({ userId }: BadgesDisplayProps) {
  const { data: userBadges = [] } = useUserBadges(userId);
  const { data: allBadges = [] } = useAllBadges();
  const previousBadgeCount = useRef(0);

  const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badge_id));

  // Sort badges by requirement_value (ascending) so beginners come first
  const sortedBadges = useMemo(() => {
    return [...allBadges].sort((a: any, b: any) => {
      // First by requirement_value
      if (a.requirement_value !== b.requirement_value) {
        return a.requirement_value - b.requirement_value;
      }
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [allBadges]);

  // Group badges by requirement type for better organization
  const groupedBadges = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sortedBadges.forEach((badge: any) => {
      const type = badge.requirement_type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(badge);
    });
    return groups;
  }, [sortedBadges]);

  const categoryLabels: Record<string, string> = {
    level: "🎮 Level",
    posts: "📝 Posts",
    comments: "💬 Comments",
    likes: "❤️ Likes",
    friends: "👫 Friends",
    login_streak: "🔥 Streaks",
    videos: "🎬 Videos",
    shares: "📤 Shares",
    events: "🎉 Events",
    groups: "👥 Groups",
    photos: "📷 Photos",
    messages: "💌 Messages",
    reactions: "😊 Reactions",
    followers: "👁️ Followers",
    stories: "📖 Stories",
    challenges: "⚔️ Challenges",
    achievements: "🏆 Achievements",
    xp: "⭐ XP",
    trades: "🔄 Trades",
    donations: "🎁 Donations",
    other: "🏅 Other",
  };

  useEffect(() => {
    if (previousBadgeCount.current > 0 && userBadges.length > previousBadgeCount.current) {
      triggerBadgeConfetti();
    }
    previousBadgeCount.current = userBadges.length;
  }, [userBadges.length]);

  const progress = allBadges.length > 0 
    ? Math.round((userBadges.length / allBadges.length) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            🏅 Badge Collection
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {userBadges.length} / {allBadges.length}
          </Badge>
        </CardTitle>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Collection Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedBadges).map(([type, badges]) => (
          <div key={type}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              {categoryLabels[type] || type}
              <Badge variant="outline" className="text-xs">
                {badges.filter((b: any) => earnedBadgeIds.has(b.id)).length}/{badges.length}
              </Badge>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {badges.map((badge: any) => {
                const earned = earnedBadgeIds.has(badge.id);
                const userBadge = userBadges.find((ub: any) => ub.badge_id === badge.id);

                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all cursor-pointer
                          ${earned 
                            ? "border-primary bg-primary/5 hover:bg-primary/10 hover:scale-105 animate-scale-in" 
                            : "border-muted bg-muted/50 opacity-40 hover:opacity-60"
                          }
                        `}
                      >
                        <div className="text-2xl sm:text-3xl relative">
                          {badge.icon}
                          {!earned && (
                            <Lock className="absolute -bottom-1 -right-1 h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-center line-clamp-1 w-full">
                          {badge.name}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold">{badge.icon} {badge.name}</p>
                        <p className="text-sm">{badge.description}</p>
                        <p className="text-xs text-primary">
                          Requirement: {badge.requirement_value} {badge.requirement_type}
                        </p>
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
