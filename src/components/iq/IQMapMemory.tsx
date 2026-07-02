import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_mapmem_best_level";
const N = 6;

const IQMapMemory = () => {
  const [pins, setPins] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "study" | "input" | "result">("idle");
  const [level, setLevel] = useState(3);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(false);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const start = async (lvl = level) => {
    const all = Array.from({ length: N * N }, (_, i) => i).sort(() => Math.random() - 0.5);
    const ns = all.slice(0, lvl);
    setPins(ns); setPicked([]); setPhase("study");
    await new Promise(r => setTimeout(r, 2500));
    setPhase("input");
  };

  const tap = (i: number) => {
    if (phase !== "input" || picked.includes(i)) return;
    const np = [...picked, i]; setPicked(np);
    if (np.length === pins.length) {
      const ok = np.every(x => pins.includes(x));
      setCorrect(ok); setPhase("result");
      if (ok) {
        if (level > best) { setBest(level); localStorage.setItem(KEY, String(level)); }
        setLevel(level + 1);
      }
    }
  };

  const reset = () => { setLevel(3); setPhase("idle"); };

  return (
    <>
      <FloatingHowItWorks title="How IQMap Memory works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Map Memory
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> L{best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Remember pin locations · Level {level} ({level} pins)</div>
        <div className="grid grid-cols-6 gap-1 max-w-[240px] mx-auto bg-emerald-900/30 p-2 rounded-lg">
          {Array.from({ length: N * N }).map((_, i) => {
            const isPin = pins.includes(i);
            const isPicked = picked.includes(i);
            const showAnswer = phase === "result";
            const showStudy = phase === "study";
            return (
              <button key={i} onClick={() => tap(i)} disabled={phase !== "input"}
                className={`aspect-square rounded text-xs flex items-center justify-center transition-all ${
                  showStudy && isPin ? "bg-rose-500" :
                  showAnswer && isPin && isPicked ? "bg-emerald-500" :
                  showAnswer && isPin ? "bg-amber-500" :
                  showAnswer && isPicked ? "bg-rose-500/60" :
                  isPicked ? "bg-primary/40" :
                  "bg-emerald-700/40 hover:bg-emerald-600/40"
                }`}>
                {(showStudy && isPin) || (showAnswer && isPin) ? "📍" : isPicked ? "•" : ""}
              </button>
            );
          })}
        </div>
        {phase === "result" && (
          <div className={`text-center font-bold ${correct ? "text-emerald-400" : "text-rose-400"}`}>
            {correct ? "✅ Correct!" : "❌ Wrong picks"}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => start(level)} variant="outline" size="sm" disabled={phase === "study" || phase === "input"}>Next</Button>
          <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMapMemory;
