import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dices, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_probability_best_streak";

const gen = () => {
  const t = Math.floor(Math.random() * 3);
  if (t === 0) {
    // Two dice: chance of sum
    const target = 5 + Math.floor(Math.random() * 5);
    const ways = [4, 5, 6, 5, 4, 3, 2][target - 5] || 0;
    const opts = [ways, ways + 1, ways - 1, 6].filter(x => x > 0);
    return { q: `Throw 2 dice. How many ways to get sum = ${target}?`, ans: ways, opts: Array.from(new Set(opts)).sort(() => Math.random() - 0.5) };
  } else if (t === 1) {
    // Coin: prob of N heads in row, return as 1/x
    const n = 2 + Math.floor(Math.random() * 4);
    const ans = Math.pow(2, n);
    return { q: `Probability of ${n} heads in a row = 1/?`, ans, opts: [ans, ans / 2, ans * 2, ans + 2].filter(x => x > 0) };
  } else {
    // Bag: r red, b blue, prob of red as percent
    const r = 2 + Math.floor(Math.random() * 5), b = 2 + Math.floor(Math.random() * 5);
    const ans = Math.round((r / (r + b)) * 100);
    const opts = [ans, ans + 10, ans - 10, 50].filter(x => x > 0 && x <= 100);
    return { q: `Bag: ${r} red, ${b} blue. Pick one. P(red) in %?`, ans, opts: Array.from(new Set(opts)).sort(() => Math.random() - 0.5) };
  }
};

const IQProbability = () => {
  const [q, setQ] = useState(gen);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const pick = (v: number) => {
    if (v === q.ans) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQProbability works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-primary" /> Probability
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Streak: <strong>{streak}</strong></div>
        <div className={`p-3 rounded-lg text-sm text-center ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>{q.q}</div>
        <div className="grid grid-cols-2 gap-2">
          {q.opts.map((o, i) => <Button key={i} onClick={() => pick(o)} variant="outline" size="sm">{o}</Button>)}
        </div>
        <Button onClick={() => { setStreak(0); setQ(gen()); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQProbability;
