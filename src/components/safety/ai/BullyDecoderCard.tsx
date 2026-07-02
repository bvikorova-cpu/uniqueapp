import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScanText, Sparkles, AlertTriangle } from "lucide-react";
import { useBullyDecoder } from "@/hooks/useSafetyAIFeatures";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-600",
};

export function BullyDecoderCard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { items, decode } = useBullyDecoder();
  const last = items[0];

  return (
    <>
      <FloatingHowItWorks title={"Bully Decoder Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Bully Decoder Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bully Decoder Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-orange-500/20 bg-gradient-to-br from-orange-950/40 via-card/40 to-red-950/30 backdrop-blur-xl p-5 hover:border-orange-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
              <ScanText className="w-5 h-5 text-orange-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Bully Message Decoder</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-600 text-white shadow-md ring-1 ring-orange-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 10 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">AI decodes severity, type, red flags + safe reply</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-orange-950/95 to-red-950/95 border-orange-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-orange-100 flex items-center gap-2">
            <ScanText className="w-5 h-5" /> Bully Message Decoder
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the bullying message here (text, DM, comment)..."
          rows={5}
          className="bg-black/40 border-orange-500/30 text-orange-50 placeholder:text-orange-300/40"
        />
        <Button
          onClick={() => decode.mutate(text, { onSuccess: () => setText("") })}
          disabled={text.length < 5 || decode.isPending}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {decode.isPending ? "Decoding..." : "Decode Message (10 credits)"}
        </Button>

        {last && (
          <div className="space-y-3 mt-3 max-h-96 overflow-auto">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${SEVERITY_COLORS[last.severity] || "bg-gray-500"}`}>
                  {last.severity?.toUpperCase()}
                </span>
                <span className="text-[11px] text-orange-200 capitalize">{last.bully_type?.replace("-", " ")}</span>
              </div>
              <p className="text-xs text-orange-100/90 mb-2">{last.emotional_impact}</p>
              <div className="text-xs">
                <p className="font-bold text-orange-200 mb-1">Suggested response:</p>
                <p className="italic text-orange-50/90">"{last.suggested_response}"</p>
              </div>
            </div>
            {Array.isArray(last.action_steps) && (
              <div className="space-y-1">
                {(last.action_steps as any[]).map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-orange-500/5 border border-orange-500/10 text-xs text-orange-100">
                    <span className="font-bold">[{s.priority}]</span> {s.step}
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(last.red_flags) && last.red_flags.length > 0 && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-xs font-bold text-red-300 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" /> Red flags
                </p>
                <ul className="text-[11px] text-red-100 list-disc list-inside">
                  {(last.red_flags as string[]).map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
