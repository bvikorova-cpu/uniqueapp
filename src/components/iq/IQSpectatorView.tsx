import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Trophy } from "lucide-react";
import IQDuelChat from "./IQDuelChat";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface DuelRow {
  id: string;
  host_id: string;
  opponent_id: string | null;
  host_score: number;
  opponent_score: number;
  host_finished: boolean;
  opponent_finished: boolean;
  status: string;
  winner_id: string | null;
  mode: string;
  questions: unknown;
}

interface ProfileLite {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/**
 * Read-only spectator window for an ongoing or finished IQ duel.
 * Subscribes to realtime updates on iq_duels and renders a live scoreboard + chat.
 */
export default function IQSpectatorView({
  duelId,
  myUserId,
  myName,
  onClose,
}: {
  duelId: string;
  myUserId: string;
  myName: string;
  onClose: () => void;
}) {
  const [duel, setDuel] = useState<DuelRow | null>(null);
  const [host, setHost] = useState<ProfileLite | null>(null);
  const [opponent, setOpponent] = useState<ProfileLite | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("iq_duels")
        .select("id,host_id,opponent_id,host_score,opponent_score,host_finished,opponent_finished,status,winner_id,mode,questions")
        .eq("id", duelId)
        .maybeSingle();
      if (!mounted || !data) return;
      setDuel(data as DuelRow);
      const ids = [data.host_id, data.opponent_id].filter(Boolean) as string[];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,full_name,avatar_url")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p) => [p.id, p as ProfileLite]));
        setHost(map.get(data.host_id) ?? null);
        if (data.opponent_id) setOpponent(map.get(data.opponent_id) ?? null);
      }
    };

    load();

    const ch = supabase
      .channel(`spectator-duel:${duelId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "iq_duels", filter: `id=eq.${duelId}` },
        (payload) => {
          setDuel((prev) => ({ ...(prev ?? {} as DuelRow), ...(payload.new as DuelRow) }));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [duelId]);

  const totalQ = Array.isArray(duel?.questions) ? (duel!.questions as unknown[]).length : 0;
  const isFinished = duel?.status === "finished";

  return (
    <>
      <FloatingHowItWorks title="How IQSpectator View works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            Spectating duel
            <Badge variant="outline" className="ml-1 capitalize text-[10px]">{duel?.mode ?? "…"}</Badge>
            {isFinished && <Badge className="bg-amber-500 text-white text-[10px]">Final</Badge>}
          </DialogTitle>
        </DialogHeader>

        {!duel ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ p: host, score: duel.host_score, done: duel.host_finished, id: duel.host_id },
                { p: opponent, score: duel.opponent_score, done: duel.opponent_finished, id: duel.opponent_id }].map((side, i) => {
                const isWinner = isFinished && duel.winner_id === side.id;
                return (
                  <motion.div
                    key={i}
                    animate={{ scale: isWinner ? 1.03 : 1 }}
                    className={`p-3 rounded-lg border text-center ${
                      isWinner
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-400/50"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground truncate">
                      {side.id ? (
                        <Link to={`/iq-platform/profile/${side.id}`} className="hover:underline hover:text-primary">
                          {side.p?.full_name ?? "Player"}
                        </Link>
                      ) : "Waiting…"}
                    </div>
                    <div className="text-3xl font-black mt-1">
                      {side.score}
                      {totalQ > 0 && <span className="text-xs text-muted-foreground">/{totalQ}</span>}
                    </div>
                    <div className="text-[10px] mt-1">
                      {isWinner ? (
                        <span className="text-amber-600 font-bold flex items-center justify-center gap-1">
                          <Trophy className="h-3 w-3" /> Winner
                        </span>
                      ) : side.done ? (
                        <span className="text-green-600 font-semibold">Finished</span>
                      ) : (
                        <span className="text-muted-foreground">Playing…</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <IQDuelChat duelId={duelId} myUserId={myUserId} myName={myName} />
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
    );
}
