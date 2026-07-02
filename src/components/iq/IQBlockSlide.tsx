import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Move, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_blockslide_best_moves";
const W = 4, H = 5;

// Klotski-lite: target is to slide the 2x2 block (id=1) to bottom-center exit
// Layout: 0 empty, 1 main (2x2), 2 horizontal 2x1, 3 vertical 1x2, 4 single 1x1
type Block = { id: number; r: number; c: number; w: number; h: number; color: string };

const initial = (): Block[] => [
  { id: 1, r: 0, c: 1, w: 2, h: 2, color: "bg-rose-500" },
  { id: 2, r: 0, c: 0, w: 1, h: 2, color: "bg-sky-500" },
  { id: 3, r: 0, c: 3, w: 1, h: 2, color: "bg-sky-500" },
  { id: 4, r: 2, c: 0, w: 1, h: 2, color: "bg-emerald-500" },
  { id: 5, r: 2, c: 3, w: 1, h: 2, color: "bg-emerald-500" },
  { id: 6, r: 2, c: 1, w: 2, h: 1, color: "bg-amber-500" },
  { id: 7, r: 3, c: 1, w: 1, h: 1, color: "bg-violet-500" },
  { id: 8, r: 3, c: 2, w: 1, h: 1, color: "bg-violet-500" },
  { id: 9, r: 4, c: 0, w: 1, h: 1, color: "bg-pink-500" },
  { id: 10, r: 4, c: 3, w: 1, h: 1, color: "bg-pink-500" },
];

const occupies = (blocks: Block[], skipId: number) => {
  const grid = Array.from({ length: H }, () => Array(W).fill(0));
  blocks.forEach(b => {
    if (b.id === skipId) return;
    for (let r = b.r; r < b.r + b.h; r++) for (let c = b.c; c < b.c + b.w; c++) grid[r][c] = b.id;
  });
  return grid;
};

const canMove = (blocks: Block[], b: Block, dr: number, dc: number) => {
  const nr = b.r + dr, nc = b.c + dc;
  if (nr < 0 || nc < 0 || nr + b.h > H || nc + b.w > W) return false;
  const grid = occupies(blocks, b.id);
  for (let r = nr; r < nr + b.h; r++) for (let c = nc; c < nc + b.w; c++) if (grid[r][c] !== 0) return false;
  return true;
};

const IQBlockSlide = () => {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const move = (dr: number, dc: number) => {
    if (sel === null || done) return;
    const b = blocks.find(x => x.id === sel)!;
    if (!canMove(blocks, b, dr, dc)) return;
    const nb = blocks.map(x => x.id === sel ? { ...x, r: x.r + dr, c: x.c + dc } : x);
    setBlocks(nb); setMoves(moves + 1);
    const main = nb.find(x => x.id === 1)!;
    if (main.r === 3 && main.c === 1) {
      setDone(true);
      const m = moves + 1;
      if (best === 0 || m < best) { setBest(m); localStorage.setItem(KEY, String(m)); }
    }
  };

  const reset = () => { setBlocks(initial()); setSel(null); setMoves(0); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQBlock Slide works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="w-5 h-5 text-primary" /> Block Slide
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} moves</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Slide the red block to bottom · Moves: <strong>{moves}</strong></div>
        <div className="relative mx-auto bg-background/60 border border-border/40 rounded-lg p-1" style={{ width: 200, height: 250 }}>
          {blocks.map(b => (
            <button key={b.id} onClick={() => setSel(b.id)}
              className={`absolute rounded-md transition-all ${b.color} ${sel === b.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""} ${b.id === 1 ? "ring-1 ring-white/40" : ""}`}
              style={{ left: b.c * 50 + 2, top: b.r * 50 + 2, width: b.w * 50 - 4, height: b.h * 50 - 4 }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 max-w-[150px] mx-auto">
          <div />
          <Button size="sm" variant="outline" onClick={() => move(-1, 0)} disabled={sel === null}>↑</Button>
          <div />
          <Button size="sm" variant="outline" onClick={() => move(0, -1)} disabled={sel === null}>←</Button>
          <Button size="sm" variant="outline" onClick={() => move(1, 0)} disabled={sel === null}>↓</Button>
          <Button size="sm" variant="outline" onClick={() => move(0, 1)} disabled={sel === null}>→</Button>
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Solved in {moves} moves!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQBlockSlide;
