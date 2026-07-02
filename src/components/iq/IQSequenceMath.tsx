import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sigma, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_seqmath_best_streak";

const gen = () => {
  const t = Math.floor(Math.random() * 4);
  let seq: number[] = []; let next = 0;
  if (t === 0) { // arithmetic
    const a = 1 + Math.floor(Math.random() * 10), d = 2 + Math.floor(Math.random() * 8);
    seq = [a, a + d, a + 2 * d, a + 3 * d]; next = a + 4 * d;
  } else if (t === 1) { // geometric
    const a = 2 + Math.floor(Math.random() * 5), r = 2 + Math.floor(Math.random() * 3);
    seq = [a, a * r, a * r * r, a * r * r * r]; next = a * r * r * r * r;
  } else if (t === 2) { // fib-like
    const a = 1 + Math.floor(Math.random() * 5), b = 1 + Math.floor(Math.random() * 5);
    seq = [a, b, a + b, a + 2 * b]; next = 2 * a + 3 * b;
  } else { // squares offset
    const k = 1 + Math.floor(Math.random() * 5);
    seq = [1 + k, 4 + k, 9 + k, 16 + k]; next = 25 + k;
  }
  return { seq, next };
};

const IQSequenceMath = () => {
  const [q, setQ] = useState(gen);
  const [v, setV] = useState("");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const submit = () => {
    if (parseInt(v, 10) === q.next) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setV(""); setFb(""); }, 400);
    } else {
      setFb("bad"); setStreak(0);
      setTimeout(() => setFb(""), 600);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQSequence Math works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sigma className="w-5 h-5 text-primary" /> Sequence Math
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Find the next term · Streak: <strong>{streak}</strong></div>
        <div className={`p-4 rounded-lg text-center text-xl font-mono font-bold ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          {q.seq.join(", ")}, ?
        </div>
        <div className="flex gap-2">
          <Input type="number" value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Next term" />
          <Button onClick={submit} size="sm">OK</Button>
        </div>
        <Button onClick={() => { setQ(gen()); setStreak(0); setV(""); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQSequenceMath;
