import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Sparkles, Upload } from "lucide-react";
import { useMoodMirror } from "@/hooks/useWellnessAIFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function MoodMirrorCard() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { history, analyze } = useMoodMirror();
  const last = history[0];

  const handleFile = (file: File) => {
    if (file.size > 5_000_000) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <FloatingHowItWorks title="MoodMirrorCard — How it works" steps={[{title:"Open this tool",desc:"Access MoodMirrorCard within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPreview(null); }}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-card/40 to-pink-950/30 backdrop-blur-xl p-5 hover:border-rose-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-rose-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Mood Mirror</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-md ring-1 ring-rose-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 8 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Selfie analysis: stress, mood, recommendations</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-rose-950/95 to-pink-950/95 border-rose-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-rose-100 flex items-center gap-2"><Camera className="w-5 h-5" /> Mood Mirror</DialogTitle>
        </DialogHeader>

        <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {preview ? (
          <img src={preview} alt="Selfie preview" className="w-full max-h-64 object-contain rounded-xl border border-rose-500/30" />
        ) : (
          <Button onClick={() => inputRef.current?.click()} variant="outline" className="h-32 border-dashed border-rose-500/40 text-rose-100">
            <Upload className="w-5 h-5 mr-2" /> Upload or take a selfie
          </Button>
        )}

        <Button onClick={() => preview && analyze.mutate(preview, { onSuccess: () => setPreview(null) })}
          disabled={!preview || analyze.isPending}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold">
          <Sparkles className="w-4 h-4 mr-2" />
          {analyze.isPending ? "Analyzing..." : "Analyze Mood (8 credits)"}
        </Button>

        {last && (
          <div className="space-y-3 mt-3 max-h-72 overflow-auto">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm font-bold text-rose-100 capitalize">{last.detected_mood}</p>
              <p className="text-xs text-rose-200/80 mt-1">{last.ai_insight}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>Stress: <span className="font-bold text-rose-200">{last.stress_level}/100</span></div>
                <div>Fatigue: <span className="font-bold text-rose-200">{last.fatigue_level}/100</span></div>
              </div>
            </div>
            {Array.isArray(last.recommendations) && (
              <div className="space-y-1">
                {(last.recommendations as any[]).map((r, i) => (
                  <div key={i} className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <p className="text-xs font-bold text-rose-100 capitalize">{r.tool}</p>
                    <p className="text-[11px] text-rose-200/70">{r.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>);
}
