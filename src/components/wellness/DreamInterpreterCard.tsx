import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Moon, Sparkles } from "lucide-react";
import { useDreamInterpreter } from "@/hooks/useWellnessAIFeatures";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function DreamInterpreterCard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { dreams, interpret } = useDreamInterpreter();
  const last = dreams[0];

  return (
    <>
      <FloatingHowItWorks title="DreamInterpreterCard — How it works" steps={[{title:"Open this tool",desc:"Access DreamInterpreterCard within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-card/40 to-violet-950/30 backdrop-blur-xl p-5 hover:border-indigo-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Dream Interpreter</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-md ring-1 ring-indigo-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 10 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">AI decodes your dream + creates an illustration</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-indigo-950/95 to-violet-950/95 border-indigo-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-indigo-100 flex items-center gap-2"><Moon className="w-5 h-5" /> Dream Interpreter</DialogTitle>
        </DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe your dream in detail..." rows={5}
          className="bg-black/40 border-indigo-500/30 text-indigo-50 placeholder:text-indigo-300/40" />
        <Button onClick={() => interpret.mutate(text, { onSuccess: () => setText("") })} disabled={text.length < 10 || interpret.isPending}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold">
          <Sparkles className="w-4 h-4 mr-2" />
          {interpret.isPending ? "Interpreting..." : "Interpret Dream (10 credits)"}
        </Button>

        {last && last.status === "completed" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4 max-h-96 overflow-auto">
            {last.illustration_url && (
              <img src={last.illustration_url} alt="Dream illustration" className="w-full rounded-xl border border-indigo-500/30" />
            )}
            <p className="text-sm text-indigo-100 whitespace-pre-wrap">{last.interpretation}</p>
            {Array.isArray(last.symbols) && last.symbols.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {(last.symbols as any[]).slice(0, 6).map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-200">{s.symbol}</p>
                    <p className="text-[11px] text-indigo-100/70">{s.meaning}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
    </>);
}
