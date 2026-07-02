import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import IQDuelChat from "./IQDuelChat";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  time_limit: number;
}

interface Duel {
  id: string;
  status: "waiting" | "active" | "finished" | "cancelled";
  host_id: string;
  opponent_id: string | null;
  questions: Question[];
  host_score: number;
  opponent_score: number;
  host_finished: boolean;
  opponent_finished: boolean;
  winner_id: string | null;
  prize: number;
  entry_fee: number;
}

export default function IQDuelGame({
  duelId,
  myUserId,
  onClose,
}: {
  duelId: string;
  myUserId: string;
  onClose: () => void;
}) {
  const [duel, setDuel] = useState<Duel | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const submittedRef = useRef(false);

  // Load + subscribe
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("iq_duels").select("*").eq("id", duelId).single();
      if (mounted && data) setDuel(data as unknown as Duel);
    };
    load();

    const channel = supabase
      .channel(`iq_duel_${duelId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "iq_duels", filter: `id=eq.${duelId}` }, (payload) => {
        if (mounted) setDuel(payload.new as unknown as Duel);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [duelId]);

  // Battle Pass — award Season XP once when duel finishes (winner=300, draw=150, loser=75)
  const xpAwardedRef = useRef(false);
  useEffect(() => {
    if (!duel || duel.status !== "finished" || xpAwardedRef.current) return;
    xpAwardedRef.current = true;
    const won = duel.winner_id === myUserId;
    const tie = duel.winner_id === null;
    const xp = won ? 300 : tie ? 150 : 75;
    supabase.rpc("award_iq_season_xp", { amount: xp }).then(({ error }) => {
      if (!error) toast({ title: `+${xp} Season XP`, description: "Battle Pass progress updated" });
    });
  }, [duel?.status, duel?.winner_id, myUserId, toast]);

  // Timer
  const q = duel?.questions?.[currentIdx];
  useEffect(() => {
    if (!q || duel?.status !== "active" || submitted) return;
    setTimeLeft(q.time_limit || 30);
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          handleAnswer(""); // timeout
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [currentIdx, duel?.status, submitted]);

  const handleAnswer = (choice: string) => {
    if (!duel || submitted) return;
    const newAnswers = [...answers, choice];
    setAnswers(newAnswers);
    if (newAnswers.length >= duel.questions.length) {
      submitFinal(newAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const submitFinal = async (finalAnswers: string[]) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    const { error } = await supabase.functions.invoke("iq-duel-finalize", {
      body: { duelId, answers: finalAnswers },
    });
    if (error) toast({ title: "Submit failed", description: error.message, variant: "destructive" });
  };

  const handleCancel = async () => {
    await supabase.functions.invoke("iq-duel-finalize", { body: { duelId, action: "cancel" } });
    onClose();
  };

  if (!duel) {
    return (
      <>
        <FloatingHowItWorks title="How IQDuel Game works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Dialog open onOpenChange={onClose}>
        <DialogContent><Loader2 className="h-8 w-8 animate-spin mx-auto my-8" /></DialogContent>
      </Dialog>
      </>
      );
  }

  // WAITING for opponent
  if (duel.status === "waiting") {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Searching for opponent…</DialogTitle></DialogHeader>
          <div className="text-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">You'll be matched with the next player who picks this mode.</p>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel & refund {duel.entry_fee} credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // FINISHED
  if (duel.status === "finished") {
    const isHost = duel.host_id === myUserId;
    const myScore = isHost ? duel.host_score : duel.opponent_score;
    const oppScore = isHost ? duel.opponent_score : duel.host_score;
    const won = duel.winner_id === myUserId;
    const tie = duel.winner_id === null;
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>{won ? "🏆 Victory!" : tie ? "🤝 Draw" : "Defeat"}</DialogTitle></DialogHeader>
          <div className="text-center py-6 space-y-4">
            <Trophy className={`h-16 w-16 mx-auto ${won ? "text-yellow-500" : "text-muted-foreground"}`} />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-3xl font-bold">{myScore}</p><p className="text-xs text-muted-foreground">You</p></div>
              <div><p className="text-3xl font-bold">{oppScore}</p><p className="text-xs text-muted-foreground">Opponent</p></div>
            </div>
            {won && <Badge className="bg-green-500">+{duel.prize} credits</Badge>}
            <Button onClick={onClose} className="w-full">Close</Button>
            <IQDuelChat duelId={duelId} myUserId={myUserId} myName="You" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ACTIVE — waiting for opponent to finish
  if (submitted) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Waiting for opponent…</DialogTitle></DialogHeader>
          <div className="text-center py-8 space-y-2">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Your answers are submitted.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ACTIVE — answering
  if (!q) return null;
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Question {currentIdx + 1}/{duel.questions.length}</span>
            <Badge variant={timeLeft < 10 ? "destructive" : "outline"}>
              <Clock className="h-3 w-3 mr-1" />{timeLeft}s
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <Progress value={((currentIdx) / duel.questions.length) * 100} className="h-1" />
        <div className="space-y-4 py-4">
          <p className="text-base font-semibold">{q.question}</p>
          <div className="grid grid-cols-1 gap-2">
            {(["A","B","C","D"] as const).map((letter) => (
              <Button
                key={letter}
                variant="outline"
                className="justify-start h-auto py-3 text-left whitespace-normal"
                onClick={() => handleAnswer(letter)}
              >
                <span className="font-bold mr-2">{letter}.</span>
                {q[`option_${letter.toLowerCase()}` as keyof Question] as string}
              </Button>
            ))}
          </div>
          <IQDuelChat duelId={duelId} myUserId={myUserId} myName="You" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
