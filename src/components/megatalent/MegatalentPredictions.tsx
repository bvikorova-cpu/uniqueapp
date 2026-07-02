import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Participant = { id: string; submission_id: string; user_id: string };
type Match = { id: string; round: number; slot: number; participant_a_id: string | null; participant_b_id: string | null; status: string };
type Sub = { id: string; title: string; media_url: string; media_type: string };

const MegatalentPredictions = ({ category, userId }: { category?: string; userId: string | null }) => {
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [subs, setSubs] = useState<Record<string, Sub>>({});
  const [myPrediction, setMyPrediction] = useState<{ id: string; participant_id: string; awarded: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!category) { setLoading(false); return; }
      setLoading(true);

      const { data: tours } = await supabase
        .from("battle_royale_tournaments")
        .select("*").eq("category", category).eq("status", "active")
        .order("created_at", { ascending: false }).limit(1);
      const t = tours?.[0];
      setTournament(t || null);

      if (!t) { setMatches([]); setParticipants([]); setSubs({}); setMyPrediction(null); setLoading(false); return; }

      const [{ data: ms }, { data: ps }] = await Promise.all([
        supabase.from("battle_royale_matches").select("*").eq("tournament_id", t.id).eq("round", t.current_round).eq("status", "open"),
        supabase.from("battle_royale_participants").select("*").eq("tournament_id", t.id),
      ]);
      setMatches((ms as Match[]) || []);
      setParticipants((ps as Participant[]) || []);

      const subIds = (ps || []).map((p: any) => p.submission_id);
      if (subIds.length) {
        const { data: subsData } = await supabase
          .from("talent_submissions").select("id,title,media_url,media_type").in("id", subIds);
        const sMap: Record<string, Sub> = {};
        (subsData || []).forEach((s: any) => { sMap[s.id] = s; });
        setSubs(sMap);
      }

      if (userId) {
        const { data: pred } = await supabase
          .from("battle_royale_predictions")
          .select("id, predicted_participant_id, awarded")
          .eq("tournament_id", t.id).eq("round", t.current_round).eq("user_id", userId).maybeSingle();
        setMyPrediction(pred ? { id: pred.id, participant_id: pred.predicted_participant_id, awarded: pred.awarded } : null);
      }
      setLoading(false);
    };
    load();
  }, [category, userId]);

  const choose = async (participantId: string) => {
    if (!userId) { toast.error("Login required"); return; }
    if (myPrediction || !tournament) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("battle_royale_predictions")
      .insert({
        tournament_id: tournament.id, round: tournament.current_round,
        user_id: userId, predicted_participant_id: participantId,
      })
      .select("id, predicted_participant_id, awarded").single();
    setBusy(false);
    if (error) { toast.error("Couldn't lock prediction", { description: error.message }); return; }
    setMyPrediction({ id: data.id, participant_id: data.predicted_participant_id, awarded: data.awarded });
    toast.success("Prediction locked", { description: "+10 XP if your pick wins this round" });
  };

  if (loading) return null;
  if (!tournament || matches.length === 0) return null;

  // collect candidate participants from open matches
  const candidates = matches.flatMap(m => [m.participant_a_id, m.participant_b_id]).filter(Boolean) as string[];

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Predictions - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Predictions section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Predictions.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">Predict Round {tournament.current_round}</h3>
          <Badge variant="secondary" className="ml-auto gap-1"><Sparkles className="h-3 w-3" /> +10 XP</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {myPrediction
            ? myPrediction.awarded ? "🏆 You called it! +10 XP awarded." : <><Lock className="h-3 w-3 inline" /> Locked — waiting for round results.</>
            : "Pick one talent you think will win their match this round. One pick per round."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {candidates.map((pid) => {
            const p = participants.find(x => x.id === pid);
            const sub = p ? subs[p.submission_id] : null;
            const selected = myPrediction?.participant_id === pid;
            const locked = !!myPrediction;
            return (
              <motion.button key={pid} whileHover={!locked ? { y: -2 } : undefined}
                disabled={locked || busy || !userId}
                onClick={() => choose(pid)}
                className={`relative rounded-lg overflow-hidden aspect-square border-2 transition ${
                  selected ? "border-primary ring-2 ring-primary/40" : "border-border/40"
                } ${locked && !selected ? "opacity-50" : ""}`}>
                {sub?.media_type === "video" ? (
                  <video src={sub.media_url} className="w-full h-full object-cover" muted playsInline />
                ) : sub ? (
                  <img src={sub.media_url} alt={sub.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <div className="text-white text-[10px] font-semibold truncate">{sub?.title || "Talent"}</div>
                </div>
                {selected && (
                  <Badge className="absolute top-1 right-1 text-[10px] px-1.5 py-0 gap-0.5">
                    {myPrediction?.awarded ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {myPrediction?.awarded ? "WON" : "PICKED"}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentPredictions;
