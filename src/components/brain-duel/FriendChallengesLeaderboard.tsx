import { useFriendChallengeStats } from "@/hooks/useFriendChallengeStats";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown } from "lucide-react";

export default function FriendChallengesLeaderboard() {
  const { user } = useAuth();
  const { data: friendStats = [], isLoading } = useFriendChallengeStats(user?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Friends Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : friendStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No friend matches yet
          </p>
        ) : (
          <div className="space-y-3">
            {friendStats.map((stats, index) => (
              <div
                key={stats.friend_id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-6 text-center font-semibold text-muted-foreground">
                  #{index + 1}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={stats.friend_avatar || undefined} />
                  <AvatarFallback>{stats.friend_name[0] || "?"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{stats.friend_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{stats.total_games} games</span>
                    <span>•</span>
                    <span className="text-green-500">{stats.wins}W</span>
                    <span>-</span>
                    <span className="text-red-500">{stats.losses}L</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {stats.net_credits >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`font-bold ${
                        stats.net_credits >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stats.net_credits >= 0 ? "+" : ""}
                      {stats.net_credits}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">credits</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
