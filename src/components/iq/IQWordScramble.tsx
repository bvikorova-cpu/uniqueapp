import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shuffle, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const WORDS = ["BRAIN","LOGIC","SMART","FOCUS","THINK","SPEED","MEMORY","PATTERN","NUMBER","PUZZLE","GENIUS","REASON","RECALL","MENTAL","SHARP","CLEVER","VISION","ANSWER","RIDDLE","INSIGHT"];
const KEY = "iq_word_scramble_best";
const DUR = 60;

const scramble = (w: string) => {
  const a = w.split("");
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  const out = a.join("");
  return out === w ? scramble(w) : out;
};

const IQWordScramble = () => {
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [word, setWord] = useState(""); const [shown, setShown] = useState("");
  const [guess, setGuess] = useState(""); const [score, setScore] = useState(0);
  const [time, setTime] = useState(DUR); const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok"|"err"|null>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const next = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w); setShown(scramble(w)); setGuess("");
  };

  const start = () => {
    setScore(0); setTime(DUR); next(); setPhase("play");
    if (tRef.current) window.clearInterval(tRef.current);
    tRef.current = window.setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          if (tRef.current) window.clearInterval(tRef.current);
          setPhase("done");
          setScore(s => { if (s > best) { setBest(s); localStorage.setItem(KEY, String(s)); } return s; });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const submit = () => {
    if (guess.trim().toUpperCase() === word) { setScore(s => s + 1); setFlash("ok"); next(); }
    else { setFlash("err"); }
    setTimeout(() => setFlash(null), 200);
  };

  const skip = () => next();
  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setScore(0); setTime(DUR); };

  return (
    <>
      <FloatingHowItWorks title="How IQWord Scramble works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-primary" /> Word Scramble
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase === "idle" && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
            <div className="text-xs text-muted-foreground">Unscramble as many as you can in {DUR}s</div>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase === "play" && (
          <div className={`rounded-xl border border-border/40 p-4 transition-colors ${flash==="ok"?"bg-emerald-500/20":flash==="err"?"bg-rose-500/20":"bg-background/40"}`}>
            <div className="flex justify-between text-xs mb-2">
              <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {time}s</span>
              <span>Score: <strong>{score}</strong></span>
            </div>
            <div className="text-4xl font-bold tracking-widest text-center my-4 font-mono">{shown}</div>
            <Input autoFocus value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} className="text-center uppercase text-lg" />
            <div className="flex gap-2 mt-2">
              <Button onClick={submit} className="flex-1" size="sm">Submit</Button>
              <Button onClick={skip} variant="outline" size="sm">Skip</Button>
            </div>
          </div>
        )}
        {phase === "done" && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
            <div className="text-2xl font-bold">Score: {score}</div>
            <div className="flex gap-2">
              <Button onClick={start} size="sm">Again</Button>
              <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQWordScramble;
