import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Puzzle, Trophy } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const PUZZLES = [
  { name: "Minesweeper", key: "iq_minesweeper_best_ms", unit: "ms" },
  { name: "Lights Out", key: "iq_lightsout_best_moves", unit: "mv" },
  { name: "Mastermind", key: "iq_mastermind_best_attempts", unit: "try" },
  { name: "Block Slide", key: "iq_blockslide_best_moves", unit: "mv" },
  { name: "Nonogram 5×5", key: "iq_nonogram5_best_ms", unit: "ms" },
  { name: "Kakuro 4×4", key: "iq_kakuro4_best_ms", unit: "ms" },
  { name: "Flow Connect", key: "iq_flowconnect_best_moves", unit: "mv" },
  { name: "Pipes Rotate", key: "iq_pipes_best_ms", unit: "ms" },
  { name: "Magic Square", key: "iq_magicsq_best_ms", unit: "ms" },
  { name: "Knight's Tour", key: "iq_knight_best_moves", unit: "sq" },
  { name: "River Crossing", key: "iq_river_best_moves", unit: "mv" },
  { name: "4-Queens", key: "iq_nqueens4_solved", unit: "wins" },
  { name: "Tangram", key: "iq_tangram_solved", unit: "wins" },
  { name: "Maze Runner", key: "iq_maze_best_ms", unit: "ms" },
];

const fmt = (v: number, u: string) => {
  if (u === "ms") return `${(v / 1000).toFixed(1)}s`;
  return `${v} ${u}`;
};

const IQPuzzleSummary = () => {
  const [stats, setStats] = useState<{ name: string; v: number; unit: string }[]>([]);

  useEffect(() => {
    const s = PUZZLES.map(p => ({ name: p.name, v: parseInt(localStorage.getItem(p.key) || "0", 10), unit: p.unit }));
    setStats(s);
  }, []);

  const completed = stats.filter(s => s.v > 0).length;

  return (
    <>
      <FloatingHowItWorks title="How IQPuzzle Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-primary" /> Puzzle Pack Summary
          <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {completed}/{PUZZLES.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.name} className={`p-2 rounded border ${s.v > 0 ? "border-primary/30 bg-primary/5" : "border-border/30 bg-background/40"}`}>
              <div className="text-[11px] text-muted-foreground">{s.name}</div>
              <div className={`text-sm font-bold ${s.v > 0 ? "text-primary" : "text-muted-foreground/60"}`}>
                {s.v > 0 ? fmt(s.v, s.unit) : "—"}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 bg-background/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${(completed / PUZZLES.length) * 100}%` }} />
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQPuzzleSummary;
