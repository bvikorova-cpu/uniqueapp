import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileCheck, Sparkles, Plus, Trash2, Download } from "lucide-react";
import { useEvidenceBuilder } from "@/hooks/useSafetyAIFeatures";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function EvidenceBuilderCard() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [incidents, setIncidents] = useState<{ date: string; description: string }[]>([
    { date: "", description: "" },
  ]);
  const { items, build } = useEvidenceBuilder();
  const last = items[0] as any;

  const updateIncident = (i: number, key: "date" | "description", v: string) => {
    setIncidents((prev) => prev.map((inc, idx) => (idx === i ? { ...inc, [key]: v } : inc)));
  };

  const downloadReport = () => {
    if (!last?.formal_report) return;
    const blob = new Blob([`${last.title}\n\n${last.formal_report}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${last.title.replace(/\s+/g, "_")}_evidence_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <FloatingHowItWorks title={"Evidence Builder Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Evidence Builder Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Evidence Builder Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-card/40 to-yellow-950/30 backdrop-blur-xl p-5 hover:border-amber-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Evidence Builder</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-600 text-white shadow-md ring-1 ring-amber-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 3 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Formal report + timeline for school/police</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-amber-950/95 to-yellow-950/95 border-amber-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-amber-100 flex items-center gap-2">
            <FileCheck className="w-5 h-5" /> AI Evidence Builder
          </DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Case title (e.g. 'Cyberbullying by Classmate X')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-black/40 border-amber-500/30 text-amber-50 placeholder:text-amber-300/40"
        />
        <div className="space-y-2 max-h-60 overflow-auto">
          {incidents.map((inc, i) => (
            <div key={i} className="flex gap-2">
              <Input
                type="date"
                value={inc.date}
                onChange={(e) => updateIncident(i, "date", e.target.value)}
                className="w-36 bg-black/40 border-amber-500/30 text-amber-50"
              />
              <Textarea
                placeholder="What happened?"
                value={inc.description}
                onChange={(e) => updateIncident(i, "description", e.target.value)}
                rows={2}
                className="flex-1 bg-black/40 border-amber-500/30 text-amber-50 placeholder:text-amber-300/40"
              />
              {incidents.length > 1 && (
                <Button size="icon" variant="ghost" onClick={() => setIncidents(incidents.filter((_, idx) => idx !== i))}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIncidents([...incidents, { date: "", description: "" }])}
          className="border-amber-500/30 text-amber-100"
        >
          <Plus className="w-3 h-3 mr-1" /> Add incident
        </Button>
        <Button
          onClick={() =>
            build.mutate(
              { title, incidents: incidents.filter((i) => i.description.length > 3) },
              { onSuccess: () => { setTitle(""); setIncidents([{ date: "", description: "" }]); } }
            )
          }
          disabled={title.length < 3 || incidents.filter((i) => i.description.length > 3).length === 0 || build.isPending}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {build.isPending ? "Building report..." : "Build Evidence Pack (3 credits)"}
        </Button>

        {last && (
          <div className="space-y-3 mt-3 max-h-[28rem] overflow-auto">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-bold text-amber-100 mb-1">{last.title}</p>
              <p className="text-xs text-amber-100/80 whitespace-pre-wrap leading-relaxed">{last.incident_summary}</p>
            </div>
            {last.emotional_impact_summary && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs font-bold text-rose-300 mb-1">Emotional impact</p>
                <p className="text-[11px] text-rose-100/80 leading-relaxed">{last.emotional_impact_summary}</p>
              </div>
            )}
            {Array.isArray(last.recommended_recipients) && last.recommended_recipients.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-amber-200">Recommended recipients</p>
                {(last.recommended_recipients as any[]).map((r, i) => (
                  <div key={i} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/15">
                    <p className="text-xs font-semibold text-amber-200">{r.name}</p>
                    <p className="text-[11px] text-amber-100/70 mt-0.5">{r.reason}</p>
                    {r.suggested_action && <p className="text-[11px] text-amber-300/60 mt-0.5">→ {r.suggested_action}</p>}
                  </div>
                ))}
              </div>
            )}
            {last.legal_considerations && (
              <div className="p-2.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
                <p className="text-xs font-bold text-slate-300 mb-1">Legal considerations</p>
                <p className="text-[11px] text-slate-100/80 leading-relaxed">{last.legal_considerations}</p>
              </div>
            )}
            <Button onClick={downloadReport} size="sm" className="w-full bg-amber-600 hover:bg-amber-500 text-white">
              <Download className="w-3 h-3 mr-1" /> Download Full Report
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
