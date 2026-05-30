import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Trophy, Users, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  entry_fee: number;
  prize_pool: number;
  status: string;
  max_participants: number;
  starts_at: string | null;
  ends_at: string | null;
  participant_count?: number;
  joined?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-600",
  upcoming: "bg-cyan-600",
  completed: "bg-muted",
};

export function QuantumTournaments({ onBack }: { onBack: () => void }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  useEffect(() => { fetchTournaments(); }, []);

  const fetchTournaments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: tData } = await supabase.from("quantum_tournaments").select("*").order("created_at", { ascending: false });
    
    const enriched = await Promise.all((tData || []).map(async (t: any) => {
      const { count } = await supabase.from("quantum_tournament_participants").select("id", { count: "exact", head: true }).eq("tournament_id", t.id);
      let joined = false;
      if (user) {
        const { data: p } = await supabase.from("quantum_tournament_participants").select("id").eq("tournament_id", t.id).eq("user_id", user.id).maybeSingle();
        joined = !!p;
      }
      return { ...t, participant_count: count || 0, joined };
    }));

    setTournaments(enriched);
    setLoading(false);
  };

  const joinTournament = async (tournament: Tournament) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (tournament.joined) { toast({ title: "Already joined!" }); return; }

    if (tournament.entry_fee > 0) {
      const hasCredits = await spendCredit("custom_generation", `Tournament Entry: ${tournament.name}`);
      if (!hasCredits) { toast({ title: "Not enough credits", description: `Entry fee: ${tournament.entry_fee} credits`, variant: "destructive" }); return; }
    }

    setJoining(tournament.id);
    try {
      const { error } = await supabase.from("quantum_tournament_participants").insert({
        tournament_id: tournament.id,
        user_id: user.id,
      });
      if (error) throw error;
      toast({ title: "Joined Tournament! ⚔️", description: tournament.name });
      fetchTournaments();
    } catch (error: any) {
      toast({ title: "Failed to join", description: error.message, variant: "destructive" });
    }
    setJoining(null);
  };

  const getTimeLeft = (endsAt: string | null) => {
    if (!endsAt) return "TBD";
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Swords className="h-5 w-5 text-red-400" /> Quantum Tournaments</h2>
          <p className="text-xs text-muted-foreground">Compete in reality-collapsing events</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading tournaments...</div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-violet-500/5 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{t.name}</h3>
                <Badge className={STATUS_COLORS[t.status] || "bg-muted"}>{t.status}</Badge>
              </div>
              {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-background/50 p-2 text-center">
                  <Trophy className="h-4 w-4 mx-auto text-amber-400 mb-1" />
                  <p className="text-sm font-bold">{t.prize_pool}</p>
                  <p className="text-[10px] text-muted-foreground">Prize Pool</p>
                </div>
                <div className="rounded-lg bg-background/50 p-2 text-center">
                  <Users className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
                  <p className="text-sm font-bold">{t.participant_count}/{t.max_participants}</p>
                  <p className="text-[10px] text-muted-foreground">Participants</p>
                </div>
                <div className="rounded-lg bg-background/50 p-2 text-center">
                  <Clock className="h-4 w-4 mx-auto text-pink-400 mb-1" />
                  <p className="text-sm font-bold">{getTimeLeft(t.ends_at)}</p>
                  <p className="text-[10px] text-muted-foreground">Time Left</p>
                </div>
              </div>

              <Progress value={(t.participant_count || 0) / t.max_participants * 100} className="h-1.5" />

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Entry: {t.entry_fee > 0 ? `${t.entry_fee} credits` : "Free"}</p>
                <Button size="sm" onClick={() => joinTournament(t)} disabled={t.joined || joining === t.id || t.status === "completed"}
                  className={t.joined ? "bg-emerald-600" : "bg-red-600 hover:bg-red-700"}
                >
                  {joining === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t.joined ? "✓ Joined" : "Join Tournament"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
