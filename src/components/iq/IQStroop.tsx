import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const COLORS = [
  { name: "RED", cls: "text-rose-500" },
  { name: "BLUE", cls: "text-sky-500" },
  { name: "GREEN", cls: "text-emerald-500" },
  { name: "YELLOW", cls: "text-amber-400" },
];
const KEY = "iq_stroop_best";
const DUR = 45;

const rand = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const IQStroop = () => {
  const [phase, setPhase] = useState<"idle"|"play"|"done">("idle");
  const [word, setWord] = useState(COLORS[0]); const [color, setColor] = useState(COLORS[1]);
  const [score, setScore] = useState(0); const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(DUR); const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok"|"err"|null>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const next = () => {
    let w = rand(), c = rand();
    while (w.name === c.name) c = rand();
    setWord(w); setColor(c);
  };

  const start = () => {
    setScore(0); setStreak(0); setTime(DUR); next(); setPhase("play");
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

  const answer = (name: string) => {
    if (name === color.name) { setScore(s => s + 1 + Math.floor(streak/5)); setStreak(s => s + 1); setFlash("ok"); }
    else { setStreak(0); setFlash("err"); }
    next(); setTimeout(() => setFlash(null), 150);
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setScore(0); setStreak(0); setTime(DUR); };

  return (
    <>
      <FloatingHowItWorks title="How IQStroop works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> Color Match (Stroop)
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase === "idle" && (
          <div className="h-40 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
            <div className="text-xs text-muted-foreground text-center px-4">Tap the <strong>color</strong> of the text — not the word!</div>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase === "play" && (
          <div className={`rounded-xl border border-border/40 p-4 transition-colors ${flash==="ok"?"bg-emerald-500/10":flash==="err"?"bg-rose-500/10":"bg-background/40"}`}>
            <div className="flex justify-between text-xs mb-3">
              <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {time}s</span>
              <span>Score: <strong>{score}</strong></span>
              <span>🔥 {streak}</span>
            </div>
            <div className={`text-5xl font-black text-center my-6 ${color.cls}`}>{word.name}</div>
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map(c => (
                <Button key={c.name} variant="outline" onClick={() => answer(c.name)} className={`font-bold ${c.cls}`}>{c.name}</Button>
              ))}
            </div>
          </div>
        )}
        {phase === "done" && (
          <div className="h-40 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
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

export default IQStroop;
