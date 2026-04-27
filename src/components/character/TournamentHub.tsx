import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Crown, Swords, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const TournamentHub = () => {
  const { data: tournaments } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tournaments").select(`*, tournament_participants (count)`).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "registration": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Tournament Arena</h2>
              <p className="text-muted-foreground text-sm">Compete for eternal glory and rewards</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold" onClick={() => toast.info("Create Tournament — coming soon")}>
            <Crown className="mr-2 h-4 w-4" /> Create Tournament
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {tournaments?.map((tournament, i) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: "spring" }}
          >
            <Card className="p-5 border-border/30 bg-card/90 backdrop-blur-xl hover:border-amber-500/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
                    <h3 className="text-lg font-black">{tournament.name}</h3>
                    <Badge className={getStatusStyle(tournament.status)}>{tournament.status}</Badge>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">{tournament.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {tournament.tournament_participants?.[0]?.count || 0}/{tournament.max_participants}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      {tournament.prize_pool} credits
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(tournament.starts_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {tournament.status === "registration" && (
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold w-full sm:w-auto" onClick={() => toast.info("Join ( cr) — coming soon")}>
                      <Swords className="mr-2 h-4 w-4" /> Join ({tournament.entry_fee} cr)
                    </Button>
                  )}
                  {tournament.status === "in_progress" && (
                    <Button variant="outline" className="border-blue-500/30 text-blue-400 w-full sm:w-auto" onClick={() => toast.info("View Bracket — coming soon")}>View Bracket</Button>
                  )}
                  {tournament.status === "completed" && (
                    <Button variant="outline" className="border-amber-500/30 text-amber-400 w-full sm:w-auto" onClick={() => toast.info("View Results — coming soon")}>View Results</Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {(!tournaments || tournaments.length === 0) && (
        <Card className="p-12 text-center border-border/30 bg-card/90 backdrop-blur-xl">
          <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No active tournaments. Be the first to create one!</p>
        </Card>
      )}
    </div>
  );
};
