import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePolygraph } from "@/hooks/useLieDetectorPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function PolygraphCard() {
  const [text, setText] = useState("");
  const m = usePolygraph();
  const data = m.data;
  return (
    <>
      <FloatingHowItWorks title={"Polygraph Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Polygraph Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Polygraph Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-red-500/30 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-red-400">
          <Activity className="w-5 h-5" /> Polygraph 3D
          <Badge variant="outline" className="ml-auto text-[10px] border-red-500/40 text-red-300">2 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste statement to wire up to the polygraph..." rows={3} className="bg-background/40 border-red-500/20" />
        <Button onClick={() => m.mutate({ text })} disabled={m.isPending || text.length < 10} className="w-full bg-red-600 hover:bg-red-700 text-white">
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wiring up needles...</> : "Run Polygraph (2 cr)"}
        </Button>
        {data && (
          <div className="space-y-3 pt-3 border-t border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Truth Score</span>
              <span className="text-2xl font-bold text-red-400">{data.truthfulness_score}%</span>
            </div>
            {/* Stress Curve Bars */}
            <div className="flex items-end gap-[2px] h-24 bg-black/40 rounded p-2 border border-red-500/20">
              {(data.stress_curve || []).map((p: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${p.stress}%` }}
                  transition={{ delay: i * 0.04 }}
                  className="flex-1 rounded-t"
                  style={{ background: `hsl(${Math.max(0, 120 - p.stress * 1.2)}, 80%, 50%)` }}
                  title={p.snippet}
                />
              ))}
            </div>
            {data.peak_moments?.length > 0 && (
              <div className="text-[11px] space-y-1">
                <div className="font-semibold text-red-400">Peak stress moments:</div>
                {data.peak_moments.slice(0, 3).map((p: any, i: number) => (
                  <div key={i} className="text-muted-foreground">• {p.reason}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
