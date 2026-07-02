import { useState } from "react";
import { GitCompare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/hooks/useLieDetectorPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function ComparisonModeCard() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const m = useComparison();
  return (
    <>
      <FloatingHowItWorks title={"Comparison Mode Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Comparison Mode Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comparison Mode Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-cyan-400">
          <GitCompare className="w-5 h-5" /> Comparison Mode
          <Badge variant="outline" className="ml-auto text-[10px] border-cyan-500/40 text-cyan-300">6 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Textarea value={a} onChange={(e) => setA(e.target.value)} placeholder="Statement A..." rows={4} className="bg-background/40 border-cyan-500/20 text-xs" />
          <Textarea value={b} onChange={(e) => setB(e.target.value)} placeholder="Statement B..." rows={4} className="bg-background/40 border-cyan-500/20 text-xs" />
        </div>
        <Button onClick={() => m.mutate({ source_a: a, source_b: b })} disabled={m.isPending || !a || !b} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing...</> : "Compare (6 cr)"}
        </Button>
        {m.data && (
          <div className="space-y-2 pt-2 border-t border-cyan-500/20 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-cyan-500/10 text-center"><div className="text-[10px] uppercase">A score</div><div className="text-lg font-bold">{m.data.score_a}%</div></div>
              <div className="p-2 rounded bg-cyan-500/10 text-center"><div className="text-[10px] uppercase">B score</div><div className="text-lg font-bold">{m.data.score_b}%</div></div>
            </div>
            <div className="font-bold text-cyan-400">More credible: {m.data.more_credible}</div>
            <div className="space-y-1 max-h-32 overflow-auto">
              {(m.data.diff_findings || []).slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="p-2 rounded bg-black/30 border-l-2" style={{ borderColor: d.severity === "high" ? "rgb(239 68 68)" : d.severity === "medium" ? "rgb(234 179 8)" : "rgb(100 116 139)" }}>
                  <div className="font-semibold">{d.topic} <span className="text-[10px] text-muted-foreground">({d.conflict_type})</span></div>
                  <div className="text-[10px] text-muted-foreground">A: {d.in_a}</div>
                  <div className="text-[10px] text-muted-foreground">B: {d.in_b}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
