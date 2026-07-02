import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Radar, Sparkles } from "lucide-react";
import { useCyberRiskScan } from "@/hooks/useSafetyAIFeatures";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const RISK_COLORS: Record<string, string> = {
  safe: "bg-emerald-600",
  caution: "bg-amber-500",
  elevated: "bg-orange-600",
  severe: "bg-red-600",
};

export function CyberRiskScanCard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { items, scan } = useCyberRiskScan();
  const last = items[0];

  return (
    <>
      <FloatingHowItWorks title={"Cyber Risk Scan Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Cyber Risk Scan Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cyber Risk Scan Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-card/40 to-fuchsia-950/30 backdrop-blur-xl p-5 hover:border-violet-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
              <Radar className="w-5 h-5 text-violet-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Cyberbullying Risk Scan</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-violet-600 text-white shadow-md ring-1 ring-violet-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 12 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Scan messages/comments for threat patterns</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-violet-950/95 to-fuchsia-950/95 border-violet-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-violet-100 flex items-center gap-2">
            <Radar className="w-5 h-5" /> Cyberbullying Risk Scan
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste comments, DMs, social posts to scan for threats..."
          rows={6}
          className="bg-black/40 border-violet-500/30 text-violet-50 placeholder:text-violet-300/40"
        />
        <Button
          onClick={() => scan.mutate(text, { onSuccess: () => setText("") })}
          disabled={text.length < 10 || scan.isPending}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {scan.isPending ? "Scanning..." : "Run Risk Scan (12 credits)"}
        </Button>

        {last && (
          <div className="space-y-3 mt-3 max-h-80 overflow-auto">
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-300">Risk level</p>
                <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full text-white ${RISK_COLORS[last.risk_level] || "bg-gray-500"}`}>
                  {last.risk_level?.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-violet-300">Score</p>
                <p className="text-3xl font-black text-violet-100">{last.overall_score}<span className="text-sm text-violet-400">/100</span></p>
              </div>
            </div>
            {Array.isArray(last.threat_patterns) && (last.threat_patterns as any[]).length > 0 && (
              <div className="space-y-1">
                {(last.threat_patterns as any[]).map((t, i) => (
                  <div key={i} className="p-2 rounded-lg bg-violet-500/5 border border-violet-500/10 text-xs">
                    <span className="font-bold text-violet-200">{t.pattern}</span>{" "}
                    <span className="text-violet-300">[{t.frequency}]</span>
                    {t.example && <p className="text-[11px] text-violet-100/70 italic mt-1">"{t.example}"</p>}
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(last.safety_recommendations) && (
              <div className="space-y-1">
                {(last.safety_recommendations as any[]).map((r, i) => (
                  <div key={i} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-200">{r.action}</p>
                    <p className="text-[11px] text-emerald-100/70">{r.why}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
