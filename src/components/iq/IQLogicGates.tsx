import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_logic_gates_best";

type Gate = "AND"|"OR"|"XOR"|"NAND"|"NOR";
const GATES: Gate[] = ["AND","OR","XOR","NAND","NOR"];

const evalGate = (g: Gate, a: boolean, b: boolean) => {
  switch(g) {
    case "AND": return a && b;
    case "OR": return a || b;
    case "XOR": return a !== b;
    case "NAND": return !(a && b);
    case "NOR": return !(a || b);
  }
};

const gen = () => {
  const a = Math.random() < 0.5, b = Math.random() < 0.5;
  const g = GATES[Math.floor(Math.random()*GATES.length)];
  return { a, b, g, answer: evalGate(g,a,b) };
};

const IQLogicGates = () => {
  const [puzzle, setPuzzle] = useState(gen());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok"|"err"|null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  const answer = (v: boolean) => {
    if (v === puzzle.answer) {
      const ns = score+1; setScore(ns); setFlash("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
    } else { setScore(0); setFlash("err"); }
    setPuzzle(gen()); setTimeout(()=>setFlash(null), 200);
  };

  const reset = () => { setScore(0); setPuzzle(gen()); };

  return (
    <>
      <FloatingHowItWorks title="How IQLogic Gates works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" /> Logic Gates
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Streak: <strong>{score}</strong></span>
          <span>Evaluate the gate</span>
        </div>
        <div className={`rounded-xl border border-border/40 p-6 text-center transition-colors ${flash==="ok"?"bg-emerald-500/10":flash==="err"?"bg-rose-500/10":"bg-background/40"}`}>
          <div className="text-3xl font-mono font-bold flex items-center justify-center gap-3">
            <span className={puzzle.a?"text-emerald-400":"text-rose-400"}>{puzzle.a?"TRUE":"FALSE"}</span>
            <Badge variant="outline" className="text-base px-3 py-1">{puzzle.g}</Badge>
            <span className={puzzle.b?"text-emerald-400":"text-rose-400"}>{puzzle.b?"TRUE":"FALSE"}</span>
          </div>
          <div className="text-2xl mt-3 text-muted-foreground">= ?</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={()=>answer(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">TRUE</Button>
          <Button onClick={()=>answer(false)} className="bg-rose-600 hover:bg-rose-500 text-white">FALSE</Button>
        </div>
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQLogicGates;
