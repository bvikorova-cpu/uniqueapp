import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sailboat, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_river_best_moves";
// 0 = left, 1 = right. Items: F farmer, W wolf, G goat, C cabbage
type Side = 0 | 1;
type State = { F: Side; W: Side; G: Side; C: Side };

const valid = (s: State) => {
  if (s.W === s.G && s.F !== s.W) return false;
  if (s.G === s.C && s.F !== s.G) return false;
  return true;
};

const IQRiverCrossing = () => {
  const [s, setS] = useState<State>({ F: 0, W: 0, G: 0, C: 0 });
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => { const v = localStorage.getItem(KEY); if (v) setBest(parseInt(v, 10) || 0); }, []);

  const cross = (with_?: "W" | "G" | "C") => {
    if (done) return;
    setErr("");
    const ns: State = { ...s };
    const target: Side = (s.F === 0 ? 1 : 0);
    if (with_ && s[with_] !== s.F) { setErr("Item not on your side"); return; }
    ns.F = target;
    if (with_) ns[with_] = target;
    if (!valid(ns)) { setErr("Something would get eaten!"); return; }
    setS(ns);
    const m = moves + 1; setMoves(m);
    if (ns.F === 1 && ns.W === 1 && ns.G === 1 && ns.C === 1) {
      setDone(true);
      if (best === 0 || m < best) { setBest(m); localStorage.setItem(KEY, String(m)); }
    }
  };

  const reset = () => { setS({ F: 0, W: 0, G: 0, C: 0 }); setMoves(0); setDone(false); setErr(""); };

  const Item = ({ k, label }: { k: keyof State; label: string }) => (
    <div className={`px-2 py-1 rounded text-xs ${s[k] === 0 ? "bg-emerald-500/20" : "bg-sky-500/20"}`}>{label}</div>
  );

  return (
    <>
      <FloatingHowItWorks title="How IQRiver Crossing works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sailboat className="w-5 h-5 text-primary" /> River Crossing
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} mv</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Get farmer, wolf, goat &amp; cabbage across · {moves} moves</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 space-y-1">
            <div className="text-[10px] text-muted-foreground">LEFT</div>
            {s.F === 0 && <Item k="F" label="🧑 Farmer" />}
            {s.W === 0 && <Item k="W" label="🐺 Wolf" />}
            {s.G === 0 && <Item k="G" label="🐐 Goat" />}
            {s.C === 0 && <Item k="C" label="🥬 Cabbage" />}
          </div>
          <div className="bg-sky-500/10 border border-sky-500/30 rounded p-2 space-y-1">
            <div className="text-[10px] text-muted-foreground">RIGHT</div>
            {s.F === 1 && <Item k="F" label="🧑 Farmer" />}
            {s.W === 1 && <Item k="W" label="🐺 Wolf" />}
            {s.G === 1 && <Item k="G" label="🐐 Goat" />}
            {s.C === 1 && <Item k="C" label="🥬 Cabbage" />}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Button size="sm" variant="outline" onClick={() => cross()}>Alone</Button>
          <Button size="sm" variant="outline" onClick={() => cross("W")}>+ Wolf</Button>
          <Button size="sm" variant="outline" onClick={() => cross("G")}>+ Goat</Button>
          <Button size="sm" variant="outline" onClick={() => cross("C")}>+ Cabbage</Button>
        </div>
        {err && <div className="text-xs text-rose-400 text-center">{err}</div>}
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Solved in {moves} moves!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQRiverCrossing;
