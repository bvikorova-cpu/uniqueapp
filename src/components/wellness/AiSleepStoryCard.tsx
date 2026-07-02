import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { useAiSleepStory } from "@/hooks/useWellnessAIFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function AiSleepStoryCard() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [setting, setSetting] = useState("");
  const { stories, generate } = useAiSleepStory();

  return (
    <>
      <FloatingHowItWorks title="AiSleepStoryCard — How it works" steps={[{title:"Open this tool",desc:"Access AiSleepStoryCard within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-card/40 to-indigo-950/30 backdrop-blur-xl p-5 hover:border-blue-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">AI Sleep Story</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-md ring-1 ring-blue-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 20 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Custom bedtime story with calming voice</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-950/95 to-indigo-950/95 border-blue-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-blue-100 flex items-center gap-2"><BookOpen className="w-5 h-5" /> AI Sleep Story</DialogTitle>
        </DialogHeader>
        <Input placeholder="Theme (e.g. 'Walking through a moonlit forest')" value={theme} onChange={(e) => setTheme(e.target.value)}
          className="bg-black/40 border-blue-500/30 text-blue-50 placeholder:text-blue-300/40" />
        <Input placeholder="Setting (optional)" value={setting} onChange={(e) => setSetting(e.target.value)}
          className="bg-black/40 border-blue-500/30 text-blue-50 placeholder:text-blue-300/40" />
        <Button onClick={() => generate.mutate({ theme, setting }, { onSuccess: () => { setTheme(""); setSetting(""); } })}
          disabled={theme.length < 3 || generate.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold">
          <Sparkles className="w-4 h-4 mr-2" />
          {generate.isPending ? "Writing & narrating..." : "Generate Story (20 credits)"}
        </Button>

        {stories.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-auto mt-3">
            {stories.slice(0, 5).map((s: any) => (
              <div key={s.id} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-bold text-blue-100">{s.title}</p>
                {s.audio_url && <audio controls src={s.audio_url} className="w-full h-8 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>);
}
