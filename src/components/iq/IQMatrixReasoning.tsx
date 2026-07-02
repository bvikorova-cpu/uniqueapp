import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_matrix_best_streak";
const SHAPES = ["●", "■", "▲", "◆", "★", "♥"];

// 3x3 matrix; bottom-right missing. Rule: each row uses same color, shapes rotate by index
const gen = () => {
  const shuf = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, 3);
  const matrix: string[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(shuf[(r + c) % 3]);
  const ans = matrix[8];
  const opts = Array.from(new Set([ans, ...SHAPES.filter(s => !shuf.includes(s)).slice(0, 3)])).sort(() => Math.random() - 0.5);
  return { matrix, ans, opts };
};

const IQMatrixReasoning = () => {
  const [q, setQ] = useState(gen);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const pick = (s: string) => {
    if (s === q.ans) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQMatrix Reasoning works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-primary" /> Matrix Reasoning
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Find the missing piece · Streak: <strong>{streak}</strong></div>
        <div className={`grid grid-cols-3 gap-1 max-w-[200px] mx-auto p-2 rounded ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          {q.matrix.map((s, i) => (
            <div key={i} className="aspect-square flex items-center justify-center text-3xl bg-background/60 rounded">
              {i === 8 ? "?" : s}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {q.opts.map((o, i) => <button key={i} onClick={() => pick(o)} className="aspect-square text-2xl bg-background/60 border border-border/40 rounded hover:bg-primary/20">{o}</button>)}
        </div>
        <Button onClick={() => { setStreak(0); setQ(gen()); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMatrixReasoning;
