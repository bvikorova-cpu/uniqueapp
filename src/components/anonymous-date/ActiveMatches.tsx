import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActiveMatchesProps {
  matches: any[];
  onOpenChat: (matchId: string) => void;
}

export function ActiveMatches({ matches, onOpenChat }: ActiveMatchesProps) {
  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No active matches yet. Start finding your match!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => {
          const isUser1 = match.user1_id === match.user_id;
          const partner = isUser1 
            ? match.anonymous_dating_profiles_user2 
            : match.anonymous_dating_profiles;
          
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(match.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          );

          return (
            <Card key={match.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{partner?.anonymous_name}</h3>
                  <p className="text-sm text-muted-foreground">{partner?.age_range}</p>
                </div>
                {match.status === "revealed" && (
                  <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">
                    Revealed
                  </span>
                )}
              </div>

              {partner?.interests && (
                <div className="flex flex-wrap gap-1">
                  {partner.interests.slice(0, 3).map((interest: string) => (
                    <span key={interest} className="text-xs bg-secondary px-2 py-1 rounded">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {match.status === "revealed" ? (
                  <span>Revealed {formatDistanceToNow(new Date(match.revealed_at!))} ago</span>
                ) : (
                  <span>{daysLeft} days until reveal</span>
                )}
              </div>

              <Button
                onClick={() => onOpenChat(match.id)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}