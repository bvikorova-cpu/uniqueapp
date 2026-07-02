import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EyeOff, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_changeblind_best_streak";
const ICONS = ["★", "♥", "♦", "♣", "●", "■", "▲", "◆"];
const N = 6;

const make = () => {
  const arr = Array.from({ length: N * N }, () => ICONS[Math.floor(Math.random() * ICONS.length)]);
  const changeIdx = Math.floor(Math.random() * N * N);
  let nv = ICONS[Math.floor(Math.random() * ICONS.length)];
  while (nv === arr[changeIdx]) nv = ICONS[Math.floor(Math.random() * ICONS.length)];
  const arr2 = [...arr]; arr2[changeIdx] = nv;
  return { a: arr, b: arr2, change: changeIdx };
};

const IQChangeBlind = () => {
  const [puzzle, setPuzzle] = useState(make);
  const [show, setShow] = useState<"a" | "b" | "blank">("a");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<"" | "ok" | "bad">("");
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  useEffect(() => {
    tRef.current = window.setInterval(() => {
      setShow(p => p === "a" ? "blank" : p === "blank" ? "b" : p === "b" ? "blank" : "a");
    }, 700);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const tap = (i: number) => {
    if (i === puzzle.change) {
      const ns = streak + 1; setStreak(ns); setFeedback("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setPuzzle(make()); setFeedback(""); }, 600);
    } else {
      setFeedback("bad"); setStreak(0);
      setTimeout(() => setFeedback(""), 600);
    }
  };

  const grid = show === "a" ? puzzle.a : show === "b" ? puzzle.b : null;

  return (
    <>
      <FloatingHowItWorks title="How IQChange Blind works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-primary" /> Change Blindness
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} streak</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Find the cell that changes · Streak: <strong>{streak}</strong></div>
        <div className="grid grid-cols-6 gap-px max-w-[260px] mx-auto bg-border/30 p-px rounded">
          {Array.from({ length: N * N }).map((_, i) => (
            <button key={i} onClick={() => tap(i)}
              className={`aspect-square text-sm flex items-center justify-center bg-background/60 hover:bg-primary/20 ${feedback === "ok" && i === puzzle.change ? "bg-emerald-500/40" : ""}`}>
              {grid ? grid[i] : ""}
            </button>
          ))}
        </div>
        {feedback === "bad" && <div className="text-center text-rose-400 text-xs">❌ Wrong</div>}
        <Button onClick={() => { setPuzzle(make()); setStreak(0); }} variant="outline" size="sm" className="w-full">
          <RotateCcw className="w-3 h-3 mr-1" /> New puzzle
        </Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQChangeBlind;
