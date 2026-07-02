import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const TASKS = [
  { name: "Audio Memory", key: "iq_audiomem_best_level", unit: "L" },
  { name: "Color Recall", key: "iq_colorrecall_best", unit: "L" },
  { name: "Face Memory", key: "iq_facemem_best_streak", unit: "streak" },
  { name: "Map Memory", key: "iq_mapmem_best_level", unit: "L" },
  { name: "Spot Difference", key: "iq_spotdiff_best_streak", unit: "streak" },
  { name: "Attention Grid", key: "iq_attngrid_best_score", unit: "pts" },
  { name: "Dual Task", key: "iq_dualtask_best", unit: "pts" },
  { name: "Divide Attention", key: "iq_divattn_best", unit: "pts" },
  { name: "Visual Search", key: "iq_visualsearch_best_ms", unit: "ms" },
  { name: "Change Blindness", key: "iq_changeblind_best_streak", unit: "streak" },
  { name: "Trail Making B", key: "iq_trailmaking_best_ms", unit: "ms" },
  { name: "Digit Symbol", key: "iq_digitsymbol_best", unit: "pts" },
  { name: "Backward Count", key: "iq_backcount_best_streak", unit: "streak" },
  { name: "Go / No-Go", key: "iq_gonogo_best_score", unit: "pts" },
];

const fmt = (v: number, u: string) => u === "ms" ? `${(v / 1000).toFixed(1)}s` : `${v} ${u}`;

const IQAttentionSummary = () => {
  const [stats, setStats] = useState<{ name: string; v: number; unit: string }[]>([]);

  useEffect(() => {
    setStats(TASKS.map(t => ({ name: t.name, v: parseInt(localStorage.getItem(t.key) || "0", 10), unit: t.unit })));
  }, []);

  const completed = stats.filter(s => s.v > 0).length;

  return (
    <>
      <FloatingHowItWorks title="How IQAttention Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Memory & Attention Summary
          <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {completed}/{TASKS.length}</Badge>
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
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${(completed / TASKS.length) * 100}%` }} />
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQAttentionSummary;
