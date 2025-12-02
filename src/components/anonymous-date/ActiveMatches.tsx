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
      <Card className="p-6 sm:p-8 text-center mx-2">
        <p className="text-sm sm:text-base text-muted-foreground">No active matches yet. Start finding your match!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 px-2">
      <h2 className="text-xl sm:text-2xl font-bold">Your Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
            <Card key={match.id} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">{partner?.anonymous_name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{partner?.age_range}</p>
                </div>
                {match.status === "revealed" && (
                  <span className="bg-green-500/20 text-green-500 px-2 py-0.5 sm:py-1 rounded text-xs flex-shrink-0">
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

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                {match.status === "revealed" ? (
                  <span>Revealed {formatDistanceToNow(new Date(match.revealed_at!))} ago</span>
                ) : (
                  <span>{daysLeft} days until reveal</span>
                )}
              </div>

              <Button
                onClick={() => onOpenChat(match.id)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 h-10 sm:h-auto text-sm sm:text-base"
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