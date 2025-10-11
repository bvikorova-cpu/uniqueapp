import { useLeaderboard } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

export default function Leaderboard() {
  const { data: leaders = [], isLoading } = useLeaderboard(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Žebríček TOP 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Načítavam...</p>
        ) : leaders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Zatiaľ žiadni hráči
          </p>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader: any, index) => {
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;

              return (
                <div
                  key={leader.user_id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${index < 3 ? "bg-primary/5 border-2 border-primary/20" : "bg-muted/50"}
                  `}
                >
                  <div className="w-8 text-center font-bold text-lg">
                    {medal || `#${index + 1}`}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={leader.profile?.avatar_url} />
                    <AvatarFallback>{leader.profile?.full_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {leader.profile?.full_name || "Používateľ"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Level {leader.level}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{leader.total_points}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
