import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_nback_best";
const N = 2;
const ROUNDS = 20;
const LETTERS = ["A","B","C","D","E","F","G","H"];

const IQNBack = () => {
  const [phase, setPhase] = useState<"idle"|"play"|"done">("idle");
  const [seq, setSeq] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const start = () => {
    const s: string[] = [];
    for (let i = 0; i < ROUNDS; i++) {
      if (i >= N && Math.random() < 0.35) s.push(s[i-N]);
      else s.push(LETTERS[Math.floor(Math.random()*LETTERS.length)]);
    }
    setSeq(s); setRound(0); setScore(0); setAnswered(false); setPhase("play");
    if (tRef.current) window.clearInterval(tRef.current);
    tRef.current = window.setInterval(() => {
      setRound(r => {
        if (r + 1 >= ROUNDS) {
          if (tRef.current) window.clearInterval(tRef.current);
          setPhase("done");
          setScore(sc => { if (sc > best) { setBest(sc); localStorage.setItem(KEY, String(sc)); } return sc; });
          return r;
        }
        setAnswered(false);
        return r + 1;
      });
    }, 2000);
  };

  const match = () => {
    if (answered || round < N) return;
    setAnswered(true);
    if (seq[round] === seq[round - N]) setScore(s => s + 1);
    else setScore(s => Math.max(0, s - 1));
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setRound(0); setScore(0); setAnswered(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQNBack works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> {N}-Back
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">Tap "Match" if current letter is same as <strong>{N} steps back</strong></div>
        <div className="h-32 rounded-xl border border-border/40 bg-background/40 flex items-center justify-center">
          {phase === "idle" && <Button onClick={start}>Start ({ROUNDS} rounds)</Button>}
          {phase === "play" && (
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{seq[round]}</div>
              <div className="text-xs text-muted-foreground mt-2">Round {round+1}/{ROUNDS} · Score {score}</div>
            </div>
          )}
          {phase === "done" && (
            <div className="text-center">
              <div className="text-3xl font-bold">{score} <span className="text-xs text-muted-foreground">/ {ROUNDS-N}</span></div>
              <div className="text-xs text-muted-foreground">{score>=best&&score>0?"🏆 New best!":`Best: ${best}`}</div>
            </div>
          )}
        </div>
        {phase === "play" && (
          <Button onClick={match} disabled={answered||round<N} className="w-full" variant={answered?"secondary":"default"}>
            Match {answered && "✓"}
          </Button>
        )}
        {phase === "done" && (
          <div className="flex gap-2">
            <Button onClick={start} className="flex-1" size="sm">Again</Button>
            <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3 h-3" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQNBack;
