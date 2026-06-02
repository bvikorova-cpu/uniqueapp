import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRecommendations } from "@/hooks/useRecommendations";
import { FollowButton } from "@/components/wall/FollowButton";

export const RecommendedUsers = () => {
  const { recommendations, isLoading } = useRecommendations();

  if (isLoading || recommendations.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Suggested for You</h3>
      </div>
      <div className="space-y-3">
        {recommendations.slice(0, 5).map((rec) => (
          <div key={rec.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={rec.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {rec.profile?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{rec.profile?.full_name || "User"}</p>
                {rec.reason && (
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                )}
              </div>
            </div>
            <FollowButton userId={rec.recommended_user_id} size="sm" />
          </div>
        ))}
      </div>
    </Card>
  );
};

