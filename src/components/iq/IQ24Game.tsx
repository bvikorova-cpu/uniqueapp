import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hash, Trophy, RotateCcw, Lightbulb } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_24_solved";

// safe eval of arithmetic with parentheses
const safeEval = (s: string): number | null => {
  if (!/^[\d+\-*/(). ]+$/.test(s)) return null;
  try { const v = Function(`"use strict";return (${s})`)(); return typeof v === "number" && isFinite(v) ? v : null; }
  catch { return null; }
};

const usesAll = (expr: string, nums: number[]) => {
  const found = expr.match(/\d+/g)?.map(Number).sort((a,b)=>a-b) ?? [];
  const target = [...nums].sort((a,b)=>a-b);
  return found.length === target.length && found.every((v,i)=>v===target[i]);
};

const genNums = (): number[] => {
  // bias to puzzles likely to have a solution
  return Array.from({length:4}, () => Math.floor(Math.random()*9)+1);
};

const IQ24Game = () => {
  const [nums, setNums] = useState<number[]>(genNums());
  const [expr, setExpr] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  const submit = () => {
    if (!usesAll(expr, nums)) { setMsg("Use all 4 numbers exactly once"); return; }
    const v = safeEval(expr);
    if (v === null) { setMsg("Invalid expression"); return; }
    if (Math.abs(v - 24) < 1e-9) {
      const ns = solved+1; setSolved(ns);
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setMsg("✓ Correct! = 24");
      setTimeout(() => { setNums(genNums()); setExpr(""); setMsg(null); }, 900);
    } else setMsg(`= ${v}, not 24`);
  };

  const reset = () => { setNums(genNums()); setExpr(""); setMsg(null); setSolved(0); };
  const skip = () => { setNums(genNums()); setExpr(""); setMsg(null); };
  const insert = (s: string) => setExpr(e => e + s);

  return (
    <>
      <FloatingHowItWorks title="How IQ24Game works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" /> 24 Game
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Use all 4 numbers + operators to reach <strong>24</strong></div>
        <div className="flex justify-center gap-2">
          {nums.map((n, i) => (
            <button key={i} onClick={()=>insert(String(n))} className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/40 text-xl font-bold font-mono hover:bg-primary/30 transition-colors">{n}</button>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-1">
          {["+","−","×","÷","(",")"].map(op => (
            <Button key={op} variant="outline" size="sm" onClick={()=>insert(op==="−"?"-":op==="×"?"*":op==="÷"?"/":op)} className="font-mono">{op}</Button>
          ))}
        </div>
        <Input value={expr} onChange={e=>setExpr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="text-center font-mono text-lg" placeholder="e.g. (3+5)*3" />
        {msg && <div className={`text-xs text-center ${msg.startsWith("✓")?"text-emerald-400":"text-amber-400"}`}>{msg}</div>}
        <div className="grid grid-cols-3 gap-1">
          <Button onClick={submit} size="sm">Submit</Button>
          <Button onClick={()=>setExpr("")} variant="outline" size="sm"><Lightbulb className="w-3 h-3 mr-1" /> Clear</Button>
          <Button onClick={skip} variant="outline" size="sm">Skip</Button>
        </div>
        <Button onClick={reset} variant="ghost" size="sm" className="w-full text-xs"><RotateCcw className="w-3 h-3 mr-1" /> Reset score</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQ24Game;
