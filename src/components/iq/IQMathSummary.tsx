import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Trophy } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const TASKS = [
  { name: "Fractions", key: "iq_fractions_best_streak" },
  { name: "Equations", key: "iq_equations_best_streak" },
  { name: "Sequence Math", key: "iq_seqmath_best_streak" },
  { name: "Prime Spotter", key: "iq_primespot_best_streak" },
  { name: "Geometry", key: "iq_geometry_best_streak" },
  { name: "Probability", key: "iq_probability_best_streak" },
  { name: "Venn Logic", key: "iq_venn_best_streak" },
  { name: "Syllogism", key: "iq_syllogism_best_streak" },
  { name: "Matrix Reasoning", key: "iq_matrix_best_streak" },
  { name: "Analogies", key: "iq_analogies_best_streak" },
  { name: "Classification", key: "iq_classify_best_streak" },
  { name: "Caesar Cipher", key: "iq_codebreak_best_streak" },
  { name: "Binary", key: "iq_binary_best_streak" },
  { name: "Hex", key: "iq_hex_best_streak" },
];

const IQMathSummary = () => {
  const [stats, setStats] = useState<{ name: string; v: number }[]>([]);

  useEffect(() => {
    setStats(TASKS.map(t => ({ name: t.name, v: parseInt(localStorage.getItem(t.key) || "0", 10) })));
  }, []);

  const completed = stats.filter(s => s.v > 0).length;
  const total = stats.reduce((s, x) => s + x.v, 0);

  return (
    <>
      <FloatingHowItWorks title="How IQMath Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" /> Math &amp; Logic Summary
          <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {completed}/{TASKS.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2 text-center">Total streak points: <strong className="text-primary">{total}</strong></div>
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.name} className={`p-2 rounded border ${s.v > 0 ? "border-primary/30 bg-primary/5" : "border-border/30 bg-background/40"}`}>
              <div className="text-[11px] text-muted-foreground">{s.name}</div>
              <div className={`text-sm font-bold ${s.v > 0 ? "text-primary" : "text-muted-foreground/60"}`}>
                {s.v > 0 ? `${s.v} streak` : "—"}
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

export default IQMathSummary;
