import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Trophy, Trash2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Stat = { key: string; label: string; suffix?: string; lowerBetter?: boolean };
const STATS: Stat[] = [
  { key: "iq_reaction_best", label: "Reaction", suffix: "ms", lowerBetter: true },
  { key: "iq_number_span_best", label: "Number Span", suffix: " digits" },
  { key: "iq_mental_math_best", label: "Mental Math" },
  { key: "iq_visual_memory_best", label: "Visual Memory", suffix: " lvl" },
  { key: "iq_word_scramble_best", label: "Word Scramble" },
  { key: "iq_stroop_best", label: "Stroop" },
  { key: "iq_pattern_seq_best", label: "Pattern Seq" },
  { key: "iq_typing_best_wpm", label: "Typing", suffix: " WPM" },
  { key: "iq_schulte_best_ms", label: "Schulte", suffix: "ms", lowerBetter: true },
  { key: "iq_odd_one_best", label: "Odd One Out" },
  { key: "iq_reverse_span_best", label: "Reverse Span", suffix: " lvl" },
  { key: "iq_logic_gates_best", label: "Logic Gates" },
  { key: "iq_rotation_best", label: "Rotation" },
  { key: "iq_simon_best", label: "Simon" },
  { key: "iq_nback_best", label: "N-Back" },
  { key: "iq_anagram_hunt_best", label: "Anagram Hunt" },
  { key: "iq_estimation_best", label: "Estimation" },
];

const fmt = (s: Stat, v: number) => {
  if (s.suffix === "ms") return `${(v/1000).toFixed(2)}s`;
  return `${v}${s.suffix ?? ""}`;
};

const IQBrainSummary = () => {
  const [scores, setScores] = useState<Record<string, number>>({});

  const load = () => {
    const out: Record<string, number> = {};
    STATS.forEach(s => {
      const v = localStorage.getItem(s.key);
      if (v) { const n = parseInt(v, 10); if (n > 0) out[s.key] = n; }
    });
    setScores(out);
  };

  useEffect(() => {
    load();
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    const t = window.setInterval(load, 3000);
    return () => { window.removeEventListener("storage", onStorage); window.clearInterval(t); };
  }, []);

  const clearAll = () => {
    if (!confirm("Clear all local best scores?")) return;
    STATS.forEach(s => localStorage.removeItem(s.key));
    setScores({});
  };

  const completed = Object.keys(scores).length;
  const completion = Math.round((completed / STATS.length) * 100);

  return (
    <>
      <FloatingHowItWorks title="How IQBrain Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" /> Brain Training Summary
          <Badge variant="outline" className="ml-auto text-xs">
            <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {completed}/{STATS.length} ({completion}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2 rounded-full bg-background/60 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${completion}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STATS.map(s => {
            const v = scores[s.key];
            return (
              <div key={s.key} className={`rounded-lg p-2 border ${v ? "bg-background/60 border-primary/30" : "bg-background/30 border-border/30 opacity-60"}`}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                <div className="text-sm font-bold font-mono">{v ? fmt(s, v) : "—"}</div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" className="flex-1">Refresh</Button>
          <Button onClick={clearAll} variant="outline" size="sm" className="text-rose-400">
            <Trash2 className="w-3 h-3 mr-1" /> Clear
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQBrainSummary;
