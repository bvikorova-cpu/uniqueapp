import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Headphones, Sparkles, Play } from "lucide-react";
import { usePersonalizedMeditation } from "@/hooks/useWellnessAIFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function PersonalizedMeditationCard() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(5);
  const { meditations, generate } = usePersonalizedMeditation();

  return (
    <>
      <FloatingHowItWorks title="PersonalizedMeditationCard — How it works" steps={[{title:"Open this tool",desc:"Access PersonalizedMeditationCard within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-teal-500/20 bg-gradient-to-br from-teal-950/40 via-card/40 to-cyan-950/30 backdrop-blur-xl p-5 hover:border-teal-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-teal-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Personalized Meditation</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-teal-600 text-white shadow-md ring-1 ring-teal-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 15 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">AI script + voiceover for your exact need</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-teal-950/95 to-cyan-950/95 border-teal-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-teal-100 flex items-center gap-2"><Headphones className="w-5 h-5" /> Personalized Meditation</DialogTitle>
        </DialogHeader>
        <Input placeholder="What do you need? (e.g. 'Release work anxiety')" value={topic} onChange={(e) => setTopic(e.target.value)}
          className="bg-black/40 border-teal-500/30 text-teal-50 placeholder:text-teal-300/40" />
        <div className="flex gap-2">
          {[3, 5, 10, 15].map((m) => (
            <Button key={m} size="sm" variant={duration === m ? "default" : "outline"} onClick={() => setDuration(m)}
              className={duration === m ? "bg-teal-600 hover:bg-teal-500 text-white" : "border-teal-500/30 text-teal-100"}>
              {m} min
            </Button>
          ))}
        </div>
        <Button onClick={() => generate.mutate({ topic, duration_minutes: duration }, { onSuccess: () => setTopic("") })}
          disabled={topic.length < 3 || generate.isPending}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold">
          <Sparkles className="w-4 h-4 mr-2" />
          {generate.isPending ? "Generating..." : "Generate Meditation (15 credits)"}
        </Button>

        {meditations.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-auto mt-3">
            {meditations.slice(0, 5).map((m: any) => (
              <div key={m.id} className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <p className="text-sm font-bold text-teal-100">{m.topic}</p>
                <p className="text-xs text-teal-200/60 mb-2">{m.duration_minutes} min</p>
                {m.audio_url && <audio controls src={m.audio_url} className="w-full h-8" />}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>);
}
