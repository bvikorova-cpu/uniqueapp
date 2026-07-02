import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_maze_best_ms";
const N = 9;

// Generate maze with recursive backtracking
const genMaze = (): boolean[][] => {
  // walls[r][c] = true means wall (closed). Use cells, with walls between.
  // For simplicity: grid of cells, true = wall
  const g = Array.from({ length: N }, () => Array(N).fill(true));
  const stack: [number, number][] = [[0, 0]];
  g[0][0] = false;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const dirs = [[-2,0],[2,0],[0,-2],[0,2]].sort(() => Math.random() - 0.5);
    let moved = false;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && g[nr][nc]) {
        g[r + dr/2][c + dc/2] = false;
        g[nr][nc] = false;
        stack.push([nr, nc]); moved = true; break;
      }
    }
    if (!moved) stack.pop();
  }
  return g;
};

const IQMazeRunner = () => {
  const [maze, setMaze] = useState<boolean[][]>(genMaze);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [start, setStart] = useState(performance.now());
  const [now, setNow] = useState(performance.now());
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  useEffect(() => {
    if (done) { if (tRef.current) window.clearInterval(tRef.current); return; }
    tRef.current = window.setInterval(() => setNow(performance.now()), 100);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, [done]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (done) return;
      const [r, c] = pos;
      let nr = r, nc = c;
      if (e.key === "ArrowUp") nr--;
      else if (e.key === "ArrowDown") nr++;
      else if (e.key === "ArrowLeft") nc--;
      else if (e.key === "ArrowRight") nc++;
      else return;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N || maze[nr][nc]) return;
      e.preventDefault();
      setPos([nr, nc]);
      if (nr === N - 1 && nc === N - 1) {
        setDone(true);
        const ms = Math.round(performance.now() - start);
        if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [pos, maze, done, start, best]);

  const move = (dr: number, dc: number) => {
    if (done) return;
    const nr = pos[0] + dr, nc = pos[1] + dc;
    if (nr < 0 || nr >= N || nc < 0 || nc >= N || maze[nr][nc]) return;
    setPos([nr, nc]);
    if (nr === N - 1 && nc === N - 1) {
      setDone(true);
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const reset = () => { setMaze(genMaze()); setPos([0, 0]); setStart(performance.now()); setNow(performance.now()); setDone(false); };

  const elapsed = ((now - start) / 1000).toFixed(1);

  return (
    <>
      <FloatingHowItWorks title="How IQMaze Runner works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-primary" /> Maze Runner
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {elapsed}s</span>
          <span>Reach bottom-right</span>
        </div>
        <div className="grid gap-px mx-auto bg-border/40 p-px rounded" style={{ gridTemplateColumns: `repeat(${N}, 24px)`, width: "fit-content" }}>
          {maze.map((row, r) => row.map((wall, c) => {
            const isP = pos[0] === r && pos[1] === c;
            const isE = r === N - 1 && c === N - 1;
            return (
              <div key={`${r}-${c}`} className={`w-6 h-6 ${wall ? "bg-foreground/80" : isP ? "bg-primary" : isE ? "bg-emerald-500" : "bg-background"}`} />
            );
          }))}
        </div>
        <div className="grid grid-cols-3 gap-1 max-w-[150px] mx-auto">
          <div /><Button size="sm" variant="outline" onClick={() => move(-1, 0)}>↑</Button><div />
          <Button size="sm" variant="outline" onClick={() => move(0, -1)}>←</Button>
          <Button size="sm" variant="outline" onClick={() => move(1, 0)}>↓</Button>
          <Button size="sm" variant="outline" onClick={() => move(0, 1)}>→</Button>
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Escaped in {elapsed}s!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New maze</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMazeRunner;
