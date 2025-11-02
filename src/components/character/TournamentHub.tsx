import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const TournamentHub = () => {
  const { data: tournaments } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          tournament_participants (count)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Tournament Hub 🏆</h2>
            <p className="text-muted-foreground">Compete in epic tournaments for glory and prizes</p>
          </div>
          <Button>
            Create Tournament
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {tournaments?.map((tournament) => (
          <Card key={tournament.id} className="p-6 hover:border-yellow-500 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-foreground">{tournament.name}</h3>
                  <Badge 
                    className={
                      tournament.status === 'registration' 
                        ? 'bg-green-600' 
                        : tournament.status === 'in_progress' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-600'
                    }
                  >
                    {tournament.status}
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-4">{tournament.description}</p>

                <div className="flex items-center gap-6 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{tournament.tournament_participants?.[0]?.count || 0}/{tournament.max_participants} Participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>Prize Pool: {tournament.prize_pool} credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Starts {formatDistanceToNow(new Date(tournament.starts_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              <div>
                {tournament.status === 'registration' && (
                  <Button>
                    Join ({tournament.entry_fee} credits)
                  </Button>
                )}
                {tournament.status === 'in_progress' && (
                  <Button variant="outline">
                    View Bracket
                  </Button>
                )}
                {tournament.status === 'completed' && (
                  <Button variant="outline">
                    View Results
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!tournaments || tournaments.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No active tournaments. Be the first to create one!</p>
        </Card>
      )}
    </div>
  );
};
