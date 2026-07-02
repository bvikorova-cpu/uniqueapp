import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shapes, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_tangram_solved";
// Simplified: 7 colored shapes in pool, target silhouette is positional. User places by clicking target slots.
type Piece = { id: number; color: string; label: string };
const PIECES: Piece[] = [
  { id: 1, color: "bg-rose-500", label: "△ L" },
  { id: 2, color: "bg-rose-400", label: "△ L" },
  { id: 3, color: "bg-amber-500", label: "△ M" },
  { id: 4, color: "bg-emerald-500", label: "△ S" },
  { id: 5, color: "bg-sky-500", label: "△ S" },
  { id: 6, color: "bg-violet-500", label: "□" },
  { id: 7, color: "bg-pink-500", label: "◇" },
];
const SLOTS = 7;

const IQTangram = () => {
  const [placed, setPlaced] = useState<(number | null)[]>(Array(SLOTS).fill(null));
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [solved, setSolved] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setSolved(parseInt(s, 10) || 0); }, []);

  const place = (slot: number) => {
    if (done || sel === null) return;
    if (placed.includes(sel)) return;
    const np = [...placed]; np[slot] = sel; setPlaced(np); setSel(null);
    if (np.every((v, i) => v === i + 1)) {
      setDone(true);
      const n = solved + 1; setSolved(n); localStorage.setItem(KEY, String(n));
    }
  };

  const reset = () => { setPlaced(Array(SLOTS).fill(null)); setSel(null); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQTangram works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shapes className="w-5 h-5 text-primary" /> Tangram
          {solved > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {solved}×</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Match each piece to its slot (1→7)</div>
        <div className="grid grid-cols-7 gap-1">
          {placed.map((p, i) => (
            <button key={i} onClick={() => place(i)}
              className={`aspect-square rounded border-2 border-dashed text-xs flex items-center justify-center ${p ? PIECES[p-1].color + " border-solid" : "border-border/40 bg-background/40"}`}>
              {p ? PIECES[p-1].label : i + 1}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {PIECES.map(p => {
            const used = placed.includes(p.id);
            return (
              <button key={p.id} onClick={() => !used && setSel(p.id)} disabled={used}
                className={`aspect-square rounded text-[10px] flex flex-col items-center justify-center ${used ? "opacity-30" : p.color} ${sel === p.id ? "ring-2 ring-primary" : ""}`}>
                <span>{p.label}</span><span>{p.id}</span>
              </button>
            );
          })}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Tangram complete!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQTangram;
