import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Circle, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_venn_best_streak";

// 3-set Venn: regions A, B, C, AB, AC, BC, ABC. Question: count items satisfying logical expression.
const gen = () => {
  const a = 5 + Math.floor(Math.random() * 10);
  const b = 5 + Math.floor(Math.random() * 10);
  const c = 5 + Math.floor(Math.random() * 10);
  const ab = 1 + Math.floor(Math.random() * Math.min(a, b));
  const ac = 1 + Math.floor(Math.random() * Math.min(a - ab, c));
  const bc = 1 + Math.floor(Math.random() * Math.min(b - ab, c - ac));
  const abc = 1 + Math.floor(Math.random() * Math.min(ab, ac, bc));
  // |A ∪ B ∪ C| inclusion-exclusion
  const ans = a + b + c - ab - ac - bc + abc;
  return { a, b, c, ab, ac, bc, abc, ans };
};

const IQVennLogic = () => {
  const [q, setQ] = useState(gen);
  const [v, setV] = useState("");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const submit = () => {
    if (parseInt(v, 10) === q.ans) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setV(""); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQVenn Logic works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-primary" /> Venn Logic
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">|A∪B∪C| using inclusion-exclusion · Streak: <strong>{streak}</strong></div>
        <div className={`p-3 rounded-lg text-sm text-center font-mono ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          |A|={q.a}, |B|={q.b}, |C|={q.c}<br />|A∩B|={q.ab}, |A∩C|={q.ac}, |B∩C|={q.bc}<br />|A∩B∩C|={q.abc}
        </div>
        <div className="flex gap-2">
          <input type="number" value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
            className="flex-1 bg-background/60 border border-border/40 rounded px-3 text-center" placeholder="|A∪B∪C|" />
          <Button onClick={submit} size="sm">OK</Button>
        </div>
        <Button onClick={() => { setStreak(0); setQ(gen()); setV(""); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQVennLogic;
