import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Coins, Swords, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import IQTournamentBracket from "./IQTournamentBracket";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQTournaments() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCompetitions();
    const interval = setInterval(loadCompetitions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCompetitions = async () => {
    const [{ data: comps }, { data: countRows }] = await Promise.all([
      supabase.from("iq_competitions").select("*").order("created_at", { ascending: false }),
      supabase.rpc("get_iq_competition_counts"),
    ]);
    if (comps) setCompetitions(comps);
    if (countRows) {
      const map: Record<string, number> = {};
      (countRows as Array<{ competition_id: string; participant_count: number }>).forEach((r) => {
        map[r.competition_id] = Number(r.participant_count);
      });
      setCounts(map);
    }
  };

  const getTimeUntilEnd = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handleJoin = async (competitionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please login first", variant: "destructive" }); return; }
      const { data, error } = await supabase.functions.invoke("join-iq-competition", { body: { competitionId } });
      if (error) throw error;
      toast({ title: "Joined!", description: data.message });
      loadCompetitions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQTournaments works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">⚔️ Weekly Tournaments</h2>
      {competitions.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 text-center">
            <Swords className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active tournaments right now. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((comp, i) => (
            <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-lg transition-all border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <div>
                        <p className="font-bold">{comp.title}</p>
                        <p className="text-xs text-muted-foreground">{comp.description}</p>
                      </div>
                    </div>
                    <Badge variant={comp.status === "active" ? "default" : "secondary"}>{comp.status}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                    <div className="bg-background/50 rounded-lg p-2">
                      <Coins className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                      <p className="text-xs font-bold">{comp.entry_fee}</p>
                      <p className="text-[9px] text-muted-foreground">Entry</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-2">
                      <Trophy className="h-3 w-3 mx-auto mb-0.5 text-yellow-500" />
                      <p className="text-xs font-bold text-green-500">{comp.prize_pool}</p>
                      <p className="text-[9px] text-muted-foreground">Prize</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-2">
                      <Users className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                      <p className="text-xs font-bold">{counts[comp.id] ?? 0}/{comp.max_participants}</p>
                      <p className="text-[9px] text-muted-foreground">Players</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-2">
                      <Clock className="h-3 w-3 mx-auto mb-0.5 text-red-500" />
                      <p className="text-xs font-bold">{comp.end_time ? getTimeUntilEnd(comp.end_time) : "—"}</p>
                      <p className="text-[9px] text-muted-foreground">Left</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                      disabled={comp.status !== "active" || !!comp.finalized_at}
                      onClick={() => handleJoin(comp.id)}
                    >
                      Join Tournament
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpanded(expanded === comp.id ? null : comp.id)}
                    >
                      {expanded === comp.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      <span className="ml-1 text-xs">Bracket</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {expanded === comp.id && (
                <div className="mt-3">
                  <IQTournamentBracket
                    competitionId={comp.id}
                    bracketSize={comp.bracket_size ?? 8}
                    finalizedAt={comp.finalized_at ?? null}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
    );
}
