import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Divide, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_fractions_best_streak";

const gen = () => {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 2 + Math.floor(Math.random() * 9);
  let c = 1 + Math.floor(Math.random() * 9);
  let d = 2 + Math.floor(Math.random() * 9);
  while (a / b === c / d) { c = 1 + Math.floor(Math.random() * 9); d = 2 + Math.floor(Math.random() * 9); }
  return { a, b, c, d, ans: a / b > c / d ? "L" : "R" };
};

const IQFractions = () => {
  const [q, setQ] = useState(gen);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const pick = (side: "L" | "R") => {
    if (side === q.ans) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setFb(""); }, 400);
    } else {
      setFb("bad"); setStreak(0);
      setTimeout(() => { setQ(gen()); setFb(""); }, 600);
    }
  };

  const Frac = ({ n, d }: { n: number; d: number }) => (
    <div className="text-3xl font-bold text-center">
      <div>{n}</div>
      <div className="border-t-2 border-current">{d}</div>
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title="How IQFractions works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Divide className="w-5 h-5 text-primary" /> Fractions
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Which is bigger? · Streak: <strong>{streak}</strong></div>
        <div className={`grid grid-cols-2 gap-2 p-4 rounded-lg ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          <button onClick={() => pick("L")} className="bg-primary/10 hover:bg-primary/20 rounded-lg p-3"><Frac n={q.a} d={q.b} /></button>
          <button onClick={() => pick("R")} className="bg-primary/10 hover:bg-primary/20 rounded-lg p-3"><Frac n={q.c} d={q.d} /></button>
        </div>
        <Button onClick={() => { setQ(gen()); setStreak(0); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQFractions;
